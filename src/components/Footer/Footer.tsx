import classNames from 'classnames';
import React from 'react';
import { Todo } from '../../types/Todo';
import { Filter, FilterType } from '../../App';
type Props = {
  todos: Todo[];
  filter: FilterType;
  onFilterChange: (filter: Filter) => void;
  onClearCompleted: () => void;
};

export const Footer: React.FC<Props> = ({
  todos,
  filter,
  onFilterChange,
  onClearCompleted,
}) => {
  return (
    <>
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
                onFilterChange(Filter.All);
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
                onFilterChange(Filter.Active);
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
                onFilterChange(Filter.Completed);
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
            onClick={() => onClearCompleted()}
          >
            Clear completed
          </button>
        </footer>
      )}
    </>
  );
};
