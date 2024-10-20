'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import classNames from 'classnames';
import { RecoilRoot, atom, useRecoilState } from 'recoil';
import { FaBars, FaCheck, FaTrash } from 'react-icons/fa';
import dateToStr from './dateUtil';
import RootTheme from './theme';

// Atom 설정
const todosAtom = atom({
  key: 'app/todosAtom',
  default: JSON.parse(localStorage.getItem('todos')) || [],
});

const lastTodoIdAtom = atom({
  key: 'app/lastTodoIdAtom',
  default: parseInt(localStorage.getItem('lastTodoId')) || 0,
});

// Todo 상태 관리 Hook
function useTodosStatus() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [lastTodoId, setLastTodoId] = useRecoilState(lastTodoIdAtom);
  const lastTodoIdRef = React.useRef(lastTodoId);

  lastTodoIdRef.current = lastTodoId;

  const saveToLocalStorage = (newTodos, newLastTodoId) => {
    localStorage.setItem('todos', JSON.stringify(newTodos));
    localStorage.setItem('lastTodoId', newLastTodoId);
  };

  const addTodo = (newContent) => {
    const id = ++lastTodoIdRef.current;
    setLastTodoId(id);
    const newTodo = {
      id,
      content: newContent,
      regDate: dateToStr(new Date()),
      isCompleted: false,
    };
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos, id);
  };

  const removeTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos, lastTodoIdRef.current);
  };

  const modifyTodo = (id, newContent) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, content: newContent } : todo
    );
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos, lastTodoIdRef.current);
  };

  const toggleComplete = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos, lastTodoIdRef.current);
  };

  return {
    todos,
    addTodo,
    removeTodo,
    modifyTodo,
    toggleComplete,
  };
}

// TodoListItem 컴포넌트
const TodoListItem = ({
  todo,
  toggleComplete,
  onDelete,
  onEdit,
}) => {
  return (
    <li key={todo.id} className="tw-mb-3 tw-bg-blue-100 tw-p-2 tw-rounded-md hover:tw-bg-blue-200 transition-colors duration-200">
      <div className="tw-flex tw-items-center tw-gap-2">
        <FaCheck
          onClick={() => toggleComplete(todo.id)}
          className={classNames(
            'tw-text-3xl',
            {
              'tw-text-[--mui-color-primary-main]': todo.isCompleted,
            },
            { 'tw-text-[#dcdcdc]': !todo.isCompleted }
          )}
        />
        <div
          onClick={() => onEdit(todo.id)}
          className={classNames('tw-flex-grow tw-p-2 tw-cursor-pointer', {
            'tw-line-through': todo.isCompleted,
          })}
        >
          {todo.content}
        </div>
        <IconButton onClick={() => onDelete(todo.id)} color="inherit">
          <FaTrash />
        </IconButton>
      </div>
    </li>
  );
};

// TodoList 컴포넌트
const TodoList = () => {
  const { todos, toggleComplete, removeTodo, modifyTodo } = useTodosStatus();
  const [editingId, setEditingId] = React.useState(null);
  const [newContent, setNewContent] = React.useState('');

  const handleEdit = (id) => {
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      setEditingId(id);
      setNewContent(todo.content);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    modifyTodo(editingId, newContent);
    setEditingId(null);
    setNewContent('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setNewContent('');
  };

  return (
    <ul>
      {todos.map((todo) =>
        editingId === todo.id ? (
          <form onSubmit={handleEditSubmit} key={todo.id} className="tw-flex tw-gap-2 tw-mb-3">
            <TextField
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              autoFocus
            />
            <Button type="submit" variant="contained">
              수정
            </Button>
            <Button onClick={handleEditCancel} variant="outlined" color="secondary">
              취소
            </Button>
          </form>
        ) : (
          <TodoListItem
            key={todo.id}
            todo={todo}
            toggleComplete={toggleComplete}
            onDelete={removeTodo}
            onEdit={handleEdit}
          />
        )
      )}
    </ul>
  );
};

// App 컴포넌트
function App() {
  const { addTodo } = useTodosStatus();
  const [newTodo, setNewTodo] = React.useState('');

  const handleAddTodo = () => {
    addTodo(newTodo);
    setNewTodo('');
  };

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <div className="tw-flex-1">
            <FaBars />
          </div>
          <div className="logo-box">
            <a href="/" className="tw-font-bold">
              로고
            </a>
          </div>
          <div className="tw-flex-1 tw-flex tw-justify-end">글쓰기</div>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box className="tw-p-4">
        <TextField
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          label="할 일 입력"
          variant="outlined"
          fullWidth
        />
        <Button onClick={handleAddTodo} variant="contained" className="tw-mt-2">
          추가
        </Button>
        <TodoList />
      </Box>
    </div>
  );
}

// 최종 렌더링
export default function themeApp() {
  const theme = RootTheme();

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </RecoilRoot>
  );
}