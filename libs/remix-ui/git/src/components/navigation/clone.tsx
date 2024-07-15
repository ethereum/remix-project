import { faCaretUp, faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import LoaderIndicator from "./loaderindicator";

export const CloneNavigation = ({ eventKey, activePanel, callback }) => {

  const handleClick = () => {
    if (!callback) return
    if (activePanel === eventKey) {
      callback('')
    } else {
      callback(eventKey)
    }
  }
  return (
    <>
      <div className={'d-flex justify-content-between pb-1  pt-1 ' + (activePanel === eventKey? 'bg-light': '')}>
        <span data-id='clone-panel' onClick={()=>handleClick()} role={'button'} className='nav d-flex justify-content-start align-items-center w-75'>
          {
            activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretRight}></FontAwesomeIcon>
          }
          <label className="pl-2 nav form-check-label ">CLONE</label>
          <LoaderIndicator></LoaderIndicator>
        </span>
      </div>
    </>
  );
}
