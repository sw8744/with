import type {ReactNode} from "react";
import {Link} from "react-router-dom";

interface ButtonPropsType {
  onClick?: () => void
  children: ReactNode;
  className?: string;
  theme?: 'default' | 'white' | 'clear';
}

interface LinkPropsType {
  to?: string;
  children: ReactNode;
  className?: string;
  theme?: 'default' | 'white' | 'clear';
  reloadDocument?: boolean
}

const themeClass = {
  'default': 'bg-blue-500 !text-light shadow-sm shadow-neutral-200 hover:shadow-md hover:shadow-neutral-300',
  'white': 'bg-light border border-neutral-300 shadow-sm shadow-neutral-200 hover:shadow-md hover:shadow-neutral-300',
  'clear': 'bg-transparent border-none'
}

function Button(
  {
    children, onClick, className, theme
  }: ButtonPropsType
) {
  return (
    <button
      onClick={onClick}
      className={
        'px-5 py-2 rounded-full ' +
        'cursor-pointer transition-shadow transition-colors duration-200 ' +
        themeClass[theme ?? 'default'] +
        (className ? ' ' + className : '')
      }
    >
      {children}
    </button>
  )
}

function ButtonLink(
  {
    children, to, className, theme, reloadDocument
  }: LinkPropsType
) {
  return (
    <Link
      to={to ?? '#'}
      reloadDocument={reloadDocument}
      className={
        'px-5 py-2 rounded-full text-center ' +
        'cursor-pointer transition-shadow transition-colors duration-200 ' +
        themeClass[theme ?? 'default'] +
        (className ? ' ' + className : '')
      }
    >
      {children}
    </Link>
  )
}

export {
  Button, ButtonLink
}
