import * as React from 'react';
import {DropdownProps} from 'react-bootstrap/Dropdown';
import {useRef} from "react";

interface Props extends DropdownProps {
  id?: string;
  className?: string;
  href?: string;
  title: string
}

export const DropdownSubmenu: React.FC<Props> = (props:Props)  => {
  let refSubMenuContent = useRef(null as HTMLDivElement | null);

    let className = 'dropdown-submenu-container';
    className = props.className
      ? className + ' ' + props.className
      : className;

  const onClick = (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    if (refSubMenuContent.current) {
      let show = false;
      if (refSubMenuContent.current.classList.contains('show')) {
        hideChildren(refSubMenuContent.current);
      } else {
        show = true;
        hideSiblings();
      }
      refSubMenuContent.current.classList.toggle('show');
      if (typeof props.onToggle === 'function') {
        props.onToggle(show, event, { source: 'select'});
      }
    }
  };

  const hideSiblings = () => {
    if (refSubMenuContent.current) {
      const parents = getParents(
          refSubMenuContent.current,
          '.dropdown-menu.show'
      );
      if (parents.length > 1) {
        hideChildren(parents[1]);
      }
    }
  };

  const hideChildren = (parent: any) => {
    const children = parent.querySelectorAll('.dropdown-menu.show') as any;
    for (const child of children) {
      child.classList.remove('show');
    }
  }

  const getParents = (elem: any, selector: string) => {
    const nodes = [];
    let element = elem;
    nodes.push(element);
    while (element.parentNode) {
      if (
          typeof element.parentNode.matches === 'function' &&
          element.parentNode.matches(selector)
      ) {
        nodes.push(element.parentNode);
      }
      element = element.parentNode;
    }
    return nodes;
  }

    return (
      <div className={className} id={props.id}>
        <a
          href={props.href}
          className="dropdown-item dropdown-submenu dropdown-toggle"
          onClick={onClick}
        >
          {props.title}
        </a>
        <div
          className="dropdown-menu"
          ref={refSubMenuContent}
        >
          {props.children}
        </div>
      </div>
    );

}