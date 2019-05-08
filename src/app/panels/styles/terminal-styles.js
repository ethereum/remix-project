var csjs = require('csjs-inject')

var css = csjs`
  .panel              {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    font-size         : 12px;
    min-height        : 3em;
    overflow          : hidden;
  }
  .bar                {
    display           : flex;
    z-index           : 3;
  }
  .menu               {
    position             : relative;
    display              : flex;
    align-items          : center;
    width                : 100%;
    max-height           : 35px;
    min-height           : 35px;
  }
  .clear           {
    margin-right      : 20px;
    width             : 10px;
    cursor            : pointer;
    display           : flex;
  }
  .clear:hover              {
    color             : var(--secondary);
  }
  .toggleTerminal              {
    margin-right      : 20px;
    margin-left       : 2px;
    font-size         : 14px;
    font-weight       : bold;
    cursor            : pointer;
  }
  .toggleTerminal:hover              {
    color             : var(--secondary);
  }
  .terminal_container   {
    display             : flex;
    flex-direction      : column;
    height              : 100%;
    overflow-y          : auto;
    font-family         : monospace;
    margin              : 0px;
    background-image    : url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCgk8ZyBvcGFjaXR5PSIwLjEiPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik03MC41ODIsNDI4LjkwNGMwLjgxMSwwLDEuNjIyLDAuMjg1LDIuNDM3LDAuODUzYzAuODExLDAuNTcxLDEuMjE4LDEuMzQsMS4yMTgsMi4zMTQNCgkJCQljMCwyLjI3Ny0xLjA1OSwzLjQ5Ni0zLjE2OCwzLjY1NmMtNS4wMzgsMC44MTQtOS4zODEsMi4zNTYtMTMuMDM3LDQuNjNjLTMuNjU1LDIuMjc2LTYuNjYzLDUuMTE3LTkuMDE2LDguNTI4DQoJCQkJYy0yLjM1NywzLjQxMS00LjEwNCw3LjI3Mi01LjIzOSwxMS41NzVjLTEuMTM5LDQuMzA3LTEuNzA2LDguODE0LTEuNzA2LDEzLjUyNHYzMi42NTNjMCwyLjI3My0xLjEzOSwzLjQxMS0zLjQxMiwzLjQxMQ0KCQkJCWMtMi4yNzcsMC0zLjQxMi0xLjEzOC0zLjQxMi0zLjQxMXYtNzQuMzIzYzAtMi4yNzMsMS4xMzUtMy40MTEsMy40MTItMy40MTFjMi4yNzMsMCwzLjQxMiwxLjEzOCwzLjQxMiwzLjQxMXYxNS4xMDgNCgkJCQljMS40NjItMi40MzcsMy4yMDYtNC43NTIsNS4yMzktNi45NDVjMi4wMjktMi4xOTMsNC4yNjQtNC4xNDMsNi43MDEtNS44NDhjMi40MzctMS43MDYsNS4wNzYtMy4wODUsNy45MTktNC4xNDMNCgkJCQlDNjQuNzcxLDQyOS40MzMsNjcuNjU4LDQyOC45MDQsNzAuNTgyLDQyOC45MDR6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMTM3Ljc3Myw0MjcuMTk4YzUuNjg1LDAsMTAuOTY2LDEuMTgxLDE1LjgzOSwzLjUzNGM0Ljg3NCwyLjM1Niw5LjA1NSw1LjQ4MiwxMi41NSw5LjM4MQ0KCQkJCWMzLjQ5MiwzLjg5OSw2LjIxNCw4LjQwNyw4LjE2NCwxMy41MjRjMS45NDksNS4xMTcsMi45MjQsMTAuNDQsMi45MjQsMTUuOTYxYzAsMC45NzYtMC4zNjYsMS43OS0xLjA5NywyLjQzOA0KCQkJCWMtMC43MzEsMC42NS0xLjU4MywwLjk3NS0yLjU1OSwwLjk3NWgtNjcuOTg3YzAuNDg3LDQuMjI2LDEuNTg0LDguMjg1LDMuMjksMTIuMTg0YzEuNzA2LDMuODk5LDMuOTM3LDcuMzEyLDYuNzAxLDEwLjIzNA0KCQkJCWMyLjc2MSwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2N2MzLjczNSwxLjc4OSw3Ljg3NywyLjY4MSwxMi40MjgsMi42ODFjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCQkJYzAuNjQ3LTEuMTM2LDEuNjIyLTEuNzA2LDIuOTI0LTEuNzA2YzIuMjczLDAsMy40MTIsMS4xMzksMy40MTIsMy40MTJjMCwwLjE2My0wLjE2NCwwLjczLTAuNDg3LDEuNzA1DQoJCQkJYy0zLjQxMiw2LjAxMy04LjIwNSwxMC40NzktMTQuMzc3LDEzLjQwMmMtNi4xNzYsMi45MjQtMTIuNjcxLDQuMzg3LTE5LjQ5NSw0LjM4N2MtNS42ODksMC0xMC45MjgtMS4xODEtMTUuNzE4LTMuNTMzDQoJCQkJYy00Ljc5My0yLjM1NC04LjkzNi01LjQ4My0xMi40MjgtOS4zODJjLTMuNDk1LTMuODk5LTYuMjE0LTguNDA3LTguMTYzLTEzLjUyNGMtMS45NS01LjExOC0yLjkyNC0xMC40MzctMi45MjQtMTUuOTYyDQoJCQkJYzAtNS41MjEsMC45NzUtMTAuODQ0LDIuOTI0LTE1Ljk2MWMxLjk0OS01LjExNyw0LjY2OC05LjYyNSw4LjE2My0xMy41MjRjMy40OTItMy44OTgsNy42MzQtNy4wMjQsMTIuNDI4LTkuMzgxDQoJCQkJQzEyNi44NDYsNDI4LjM3OSwxMzIuMDg0LDQyNy4xOTgsMTM3Ljc3Myw0MjcuMTk4eiBNMTY5Ljk0LDQ2Ni4xODhjLTAuMzI4LTQuMjIzLTEuMzQxLTguMjg1LTMuMDQ2LTEyLjE4NA0KCQkJCWMtMS43MDYtMy44OTktMy45ODItNy4zMTItNi44MjMtMTAuMjM1Yy0yLjg0NC0yLjkyNC02LjE3NS01LjI3Ny05Ljk5MS03LjA2N2MtMy44MTktMS43ODUtNy45Mi0yLjY4LTEyLjMwNi0yLjY4DQoJCQkJYy00LjU1LDAtOC42OTIsMC44OTUtMTIuNDI4LDIuNjhjLTMuNzM5LDEuNzktNi45ODcsNC4xNDQtOS43NDgsNy4wNjdjLTIuNzY0LDIuOTI0LTQuOTk1LDYuMzM2LTYuNzAxLDEwLjIzNQ0KCQkJCWMtMS43MDYsMy44OTgtMi44MDIsNy45NjEtMy4yOSwxMi4xODRIMTY5Ljk0eiIvPg0KCQkJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTMwNC42OSw0MjcuNDQxYzUuMDM0LDAsOS41MDQsMS4wMTgsMTMuNDAyLDMuMDQ3YzMuODk5LDIuMDMzLDcuMTg5LDQuNjcyLDkuODcsNy45Mg0KCQkJCWMyLjY4LDMuMjUxLDQuNzA5LDcuMDY2LDYuMDkyLDExLjQ1MmMxLjM3OSw0LjM4NywyLjA3LDguODU2LDIuMDcsMTMuNDAydjQzLjYyYzAsMC45NzUtMC4zNjUsMS43ODktMS4wOTcsMi40MzgNCgkJCQljLTAuNzMsMC42NDYtMS41MDMsMC45NzUtMi4zMTMsMC45NzVjLTIuMjc2LDAtMy40MTItMS4xNC0zLjQxMi0zLjQxMnYtNDMuNjJjMC0zLjU3MS0wLjUyOS03LjEwNC0xLjU4NC0xMC42DQoJCQkJYy0xLjA1OS0zLjQ5MS0yLjYwMi02LjYxOC00LjYzLTkuMzgyYy0yLjAzMy0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4OC0xLjYyMS02LjY2Mi0yLjQzNi0xMC43MjItMi40MzYNCgkJCQljLTUuMiwwLTkuNTg3LDEuMjE4LTEzLjE1OSwzLjY1NGMtMy41NzQsMi40MzgtNi40NTcsNS41NjYtOC42NSw5LjM4MmMtMi4xOTMsMy44MTktMy44MTgsOC4wNDItNC44NzQsMTIuNjcyDQoJCQkJYy0xLjA1OSw0LjYzLTEuNTg0LDkuMDU4LTEuNTg0LDEzLjI4djMzLjYyOWMwLDAuOTc1LTAuMzY1LDEuNzg5LTEuMDk2LDIuNDM4Yy0wLjczMSwwLjY0Ni0xLjUwNSwwLjk3NS0yLjMxNSwwLjk3NQ0KCQkJCWMtMi4yNzYsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTMtNy4xMDQtMS41ODUtMTAuNmMtMS4wNTgtMy40OTEtMi42MDEtNi42MTgtNC42MjktOS4zODINCgkJCQljLTIuMDM0LTIuNzYxLTQuNTkyLTQuOTUzLTcuNjc3LTYuNThjLTMuMDg3LTEuNjIxLTYuNjYzLTIuNDM2LTEwLjcyMi0yLjQzNmMtNS4wMzcsMC05LjM0NCwwLjg5NS0xMi45MTUsMi42OA0KCQkJCWMtMy41NzUsMS43OS02LjU0Miw0LjI2Ni04Ljg5NSw3LjQzM2MtMi4zNTcsMy4xNjctNC4wNjMsNi45NDQtNS4xMTcsMTEuMzMxYy0xLjA1OSw0LjM4Ni0xLjU4NCw5LjEtMS41ODQsMTQuMTM0djMuODk5djAuMjQzDQoJCQkJdjMyLjg5N2MwLDIuMjcyLTEuMTM4LDMuNDEyLTMuNDEyLDMuNDEyYy0yLjI3NiwwLTMuNDExLTEuMTQtMy40MTEtMy40MTJ2LTc0LjU2N2MwLTIuMjczLDEuMTM1LTMuNDExLDMuNDExLTMuNDExDQoJCQkJYzIuMjczLDAsMy40MTIsMS4xMzgsMy40MTIsMy40MTF2MTIuNDI4YzIuOTI0LTUuMTk3LDYuODYxLTkuMzgyLDExLjgxOS0xMi41NWM0Ljk1NC0zLjE2NywxMC41MTctNC43NTIsMTYuNjkyLTQuNzUyDQoJCQkJYzYuOTgzLDAsMTIuOTk1LDEuOTkxLDE4LjAzMiw1Ljk3YzUuMDMzLDMuOTgzLDguNjg4LDkuMjIzLDEwLjk2NiwxNS43MTljMi43Ni02LjMzNiw2LjczOS0xMS41MzMsMTEuOTQtMTUuNTk2DQoJCQkJQzI5MS4xMjUsNDI5LjQ3NSwyOTcuMzgsNDI3LjQ0MSwzMDQuNjksNDI3LjQ0MXoiLz4NCgkJCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik0zNzguNzUzLDQyOS4zOTJjMC44MTEsMCwxLjU4NCwwLjM2NSwyLjMxNCwxLjA5N2MwLjczMSwwLjczLDEuMDk3LDEuNTA0LDEuMDk3LDIuMzE0djc0LjA4DQoJCQkJYzAsMC44MTQtMC4zNjUsMS41ODQtMS4wOTcsMi4zMTVjLTAuNzMsMC43My0xLjUwNCwxLjA5Ny0yLjMxNCwxLjA5N2MtMC45NzUsMC0xLjc5LTAuMzY2LTIuNDM4LTEuMDk3DQoJCQkJYy0wLjY1LTAuNzMxLTAuOTc1LTEuNTAxLTAuOTc1LTIuMzE1di03NC4wOGMwLTAuODExLDAuMzI0LTEuNTg0LDAuOTc1LTIuMzE0QzM3Ni45NjMsNDI5Ljc1NywzNzcuNzc4LDQyOS4zOTIsMzc4Ljc1Myw0MjkuMzkyeiINCgkJCQkvPg0KCQkJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTQ3My4zNCw0MjguNjZjMi4yNzMsMCwzLjQxMiwxLjEzOSwzLjQxMiwzLjQxMWwtMC40ODcsMS45NWwtMjQuMzY4LDM1LjMzNGwyNC4zNjgsMzUuNTc3DQoJCQkJYzAuMzIzLDAuOTc2LDAuNDg3LDEuNjI2LDAuNDg3LDEuOTVjMCwyLjI3Mi0xLjEzOSwzLjQxMi0zLjQxMiwzLjQxMmMtMS4zMDIsMC0yLjE5My0wLjQ4OC0yLjY4LTEuNDYzbC0yMi45MDYtMzMuMzg0DQoJCQkJbC0yMi42NjMsMzMuMzg0Yy0wLjgxNCwwLjk3NS0xLjc5LDEuNDYzLTIuOTI0LDEuNDYzYy0yLjI3NywwLTMuNDExLTEuMTQtMy40MTEtMy40MTJjMC0wLjMyNCwwLjE1OS0wLjk3NSwwLjQ4Ni0xLjk1DQoJCQkJbDI0LjM2OS0zNS41NzdsLTI0LjM2OS0zNS4zMzRsLTAuNDg2LTEuOTVjMC0yLjI3MiwxLjEzNC0zLjQxMSwzLjQxMS0zLjQxMWMxLjEzNCwwLDIuMTA5LDAuNDg3LDIuOTI0LDEuNDYybDIyLjY2MywzMy4xNDENCgkJCQlsMjIuOTA2LTMzLjE0MUM0NzEuMTQ2LDQyOS4xNDcsNDcyLjAzOCw0MjguNjYsNDczLjM0LDQyOC42NnoiLz4NCgkJPC9nPg0KCQk8Zz4NCgkJCTxnPg0KCQkJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMTUwLjczNCwxOTYuMjEyIDI1NS45NjksMzQ0LjUwOCAyNTUuOTY5LDI1OC4zODciLz4NCgkJCQkJPC9nPg0KCQkJCTwvZz4NCgkJCQk8ZyBvcGFjaXR5PSIwLjgiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMjU1Ljk2OSwyNTguMzg3IDI1NS45NjksMzQ0LjUwOCAzNjEuMjY3LDE5Ni4yMTIiLz4NCgkJCQkJPC9nPg0KCQkJCTwvZz4NCgkJCQk8ZyBvcGFjaXR5PSIwLjYiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMjU1Ljk2OSwxMjYuNzgxIDE1MC43MzMsMTc0LjYxMSAyNTUuOTY5LDIzNi44MTggMzYxLjIwNCwxNzQuNjExIi8+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQkJPGcgb3BhY2l0eT0iMC40NSI+DQoJCQkJCTxnPg0KCQkJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIxNTAuNzM0LDE3NC42MTIgMjU1Ljk2OSwyMzYuODE4IDI1NS45NjksMTI2Ljc4MiAyNTUuOTY5LDAuMDAxIi8+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQkJPGcgb3BhY2l0eT0iMC44Ij4NCgkJCQkJPGc+DQoJCQkJCQk8cG9seWdvbiBmaWxsPSIjMDEwMTAxIiBwb2ludHM9IjI1NS45NjksMCAyNTUuOTY5LDEyNi43ODEgMjU1Ljk2OSwyMzYuODE4IDM2MS4yMDQsMTc0LjYxMSIvPg0KCQkJCQk8L2c+DQoJCQkJPC9nPg0KCQkJPC9nPg0KCQk8L2c+DQoJPC9nPg0KPC9zdmc+DQo=')
    background-repeat   : no-repeat;
    background-position : center 15%;
    background-size     : auto calc(75% -  1.7em);
  }
  .terminal    {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    height            : 100%;
  }
  .journal            {
    margin-top        : auto;
    font-family       : monospace;
  }
  .block              {
    word-break        : break-all;
    white-space       : pre-wrap;
    line-height       : 2ch;
    padding           : 1ch;
    margin-top        : 2ch;
  }
  .cli                {
    line-height       : 1.7em;
    font-family       : monospace;
    padding           : .4em;
    color             : var(--primary)
    border-top        : solid 2px var(--secondary);
  }
  .prompt             {
    margin-right      : 0.5em;
    font-family       : monospace;
    font-weight       : bold;
    font-size         : 14px;
  }
  .input              {
    word-break        : break-all;
    outline           : none;
    font-family       : monospace;
  }
  .search {
    display           : flex;
    align-items       : center;
    width             : 330px;
    padding-left      : 20px;
    height            : 100%;
  }
  .filter                       {
    padding-right               : 0px;
    margin-right                : 0px;
    height                      : 100%;
    white-space                 : nowrap;
    overflow                    : hidden;
    text-overflow               : ellipsis;
  }
  .searchIcon                   {
    height                      : 100%;
    width                       : 25px;
    border-top-left-radius      : 3px;
    border-bottom-left-radius   : 3px;
    display                     : flex;
    align-items                 : center;
    justify-content             : center;
    margin-right                : 5px;
  }
  .listen         {
    margin-right  : 30px;
    min-width     : 40px;
    height        : 13px;
    display       : flex;
    align-items   : center;
  }
  .listenLabel {
    min-width: 50px;
  }
  .verticalLine {
    border-left       : 1px solid var(--secondary)
    height            : 65%;
  }
  .pendingTx {
    border-radius     : 50%;
    margin-right      : 30px;
    min-width         : 13px;
    height            : 13px;
    display           : flex;
    justify-content   : center;
    align-items       : center;
    font-size         : 14px;
    user-select       : none;
  }
  .dragbarHorizontal  {
    position          : absolute;
    top               : 0;
    height            : 0.5em;
    right             : 0;
    left              : 0;
    cursor            : ns-resize;
    z-index           : 999;
  }
  .ghostbar           {
    position          : absolute;
    height            : 6px;
    opacity           : 0.5;
    cursor            : row-resize;
    z-index           : 9999;
    left              : 0;
    right             : 0;
  }
`

module.exports = css
