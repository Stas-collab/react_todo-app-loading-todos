/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import * as todoService from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
enum Filter {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

type FilterType = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodoId, setLoadingTodoId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTitle, setNewTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();

    if (!trimmed) {
      setError('Title should not be empty');
      inputRef.current?.focus();

      return;
    }

    const temp: Todo = {
      id: 0,
      userId: USER_ID,
      title: trimmed,
      completed: false,
    };

    setTempTodo(temp);
    setIsAdding(true);

    setError('');

    try {
      const newTodo = await todoService.postTodos({
        title: trimmed,
        userId: USER_ID,
      });

      setTodos(prev => [...prev, newTodo]);
      setNewTitle('');
      inputRef.current?.focus();
    } catch {
      setError('Unable to add a todo');
      inputRef.current?.focus();
    } finally {
      setIsAdding(false);
      setTempTodo(null);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    setLoadingTodoId(todo.id);
    setError('');

    try {
      await todoService.patchTodo(todo.id, { completed: !todo.completed });
      setTodos(prev =>
        prev.map(t =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t,
        ),
      );
    } catch {
      setError('Unable to update a todo');
    } finally {
      setLoadingTodoId(null);
    }
  };

  const clearCompleted = async () => {
    setError('');

    const completed = todos.filter(t => t.completed);

    await Promise.allSettled(
      completed.map(async todo => {
        setLoadingTodoId(todo.id);

        try {
          await todoService.deleteTodo(todo.id);
          setTodos(prev => prev.filter(t => t.id !== todo.id));
        } catch {
          setError('Unable to delete a todo');
        } finally {
          setLoadingTodoId(null);
        }
      }),
    );
  };

  const handleDeleteTodo = async (todoId: number) => {
    setLoadingTodoId(todoId);
    setError('');
    try {
      await todoService.deleteTodo(todoId);
      setTodos(prev => prev.filter(t => t.id !== todoId));
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setLoadingTodoId(null);
    }
  };

  const filterTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  useEffect(() => {
    inputRef.current?.focus();
    setError('');
    todoService
      .getTodos()
      .then(fetchedTodos => {
        setTodos(fetchedTodos);
      })
      .catch(() => {
        setError('Unable to load todos');
      })
      .finally(() => {});
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => {
      setError('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: todos.length > 0 && todos.every(todo => todo.completed),
            })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleAddTodo}>
            <input
              ref={inputRef}
              disabled={isAdding}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={e => {
                setNewTitle(e.target.value);
              }}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {/* This is a completed todo */}
          {[...filterTodos, ...(tempTodo ? [tempTodo] : [])].map(todo => (
            <div
              data-cy="Todo"
              className={classNames('todo', { completed: todo.completed })}
              key={todo.id}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                />
              </label>
              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                ×
              </button>

              <div
                data-cy="TodoLoader"
                className={classNames('modal overlay', {
                  hidden: !(
                    loadingTodoId === todo.id || tempTodo?.id === todo.id
                  ),
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filter === Filter.All,
                })}
                data-cy="FilterLinkAll"
                onClick={() => {
                  setFilter(Filter.All);
                }}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filter === Filter.Active,
                })}
                data-cy="FilterLinkActive"
                onClick={() => {
                  setFilter(Filter.Active);
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filter === Filter.Completed,
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => {
                  setFilter(Filter.Completed);
                }}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              disabled={!todos.some(todo => todo.completed)}
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={() => clearCompleted()}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${!error ? 'hidden' : ''}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError('')}
        />
        {/* show only one message at a time */}
        {error}
      </div>
    </div>
  );
};
