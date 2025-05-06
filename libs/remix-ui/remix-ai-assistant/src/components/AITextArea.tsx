import React, { useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react'
import { getCaretCoordinates } from 'textarea-caret-ts'
import { Dropdown } from 'react-bootstrap'
import DropdownItem from 'react-bootstrap/DropdownItem'

interface Suggestion { id: string; label: string; insertText: string; }

export default function AITextArea() {
  const [value, setValue] = useState('');
  const [trigger, setTrigger] = useState<'@' | '/' | null>(null);
  const [startIdx, setStartIdx] = useState(0);
  const [token, setToken] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFunctionMenu, setShowFunctionMenu] = useState(false);
  const [triggerKey, setTriggerKey] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fetchTimer = useRef<number>();

  useEffect(() => {
    const controller = new AbortController()
    window.addEventListener('keydown', (press: any) => {
      if (press.key === '/') {
        console.log('/ key was pressed oh')
        setShowFunctionMenu(true)
      }
    }, { signal: controller.signal })

    window.addEventListener('keydown', (press: any) => {
      if (press.key === 'Backspace') {
        console.log('Backspace key was pressed oh')
        setShowFunctionMenu(false)
      }
    }, { signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [])

  const CommandMenu = () => {
    return (
      <div>
        <ul className="border w-50 list-unstyled dropdown">
          <li className="p-1 pl-3 dropdown-item">/fix</li>
          <li className="p-1 pl-3 dropdown-item">/agent</li>
          <li className="p-1 pl-3 dropdown-item">/compose</li>
          <li className="p-1 pl-3 dropdown-item">/ask</li>
        </ul>
      </div>
    )
  }
  // -----------------------------------
  // 1) Handle keydown for trigger + nav
  // -----------------------------------
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;

    // Start trigger
    if (e.key === '@' || e.key === '/') {
      setTrigger(e.key);
      setStartIdx(pos);
      setToken('');
      scheduleFetch(e.key, '');
      return;
    }

    if (!trigger) return;

    // Cancel trigger if space or backspace before the token
    if (e.key === ' ' || (e.key === 'Backspace' && pos <= startIdx)) {
      clearTrigger();
      return;
    }

    // Navigate suggestions
    if (suggestions.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
      }
    }
  };

  // -----------------------------------
  // 2) Handle change: update token, fetch, and caret pos
  // -----------------------------------
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setValue(newVal);

    if (!trigger) return;

    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const newToken = newVal.slice(startIdx, pos);
    setToken(newToken);
    scheduleFetch(trigger, newToken);

    // measure caret relative to page
    const { top: ct, left: cl } = getCaretCoordinates(ta, pos);
    const { top: taTop, left: taLeft } = ta.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    setCoords({
      top: taTop + ct + scrollY + 20, // 20px offset to drop under line
      left: taLeft + cl + scrollX,
    });
  };

  // -----------------------------------
  // 3) Debounced fetch
  // -----------------------------------
  const scheduleFetch = useCallback((tr: '@' | '/', tok: string) => {
    window.clearTimeout(fetchTimer.current);
    fetchTimer.current = window.setTimeout(async () => {
      let items: Suggestion[] = [];
      if (tr === '@') {
        const users = await fetchUsers(tok);
        items = users.map((u) => ({
          id: u.id,
          label: u.name,
          insertText: `@${u.name} `,
        }));
      } else {
        const cmds = await fetchCommands(tok);
        items = cmds.map((c) => ({
          id: c.id,
          label: c.label,
          insertText: `/${c.command} `,
        }));
      }
      setSuggestions(items);
      setSelectedIndex(0);
    }, 200);
  }, []);

  // -----------------------------------
  // 4) Selecting a suggestion
  // -----------------------------------
  const selectSuggestion = (item: Suggestion) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const before = value.slice(0, startIdx - 1);
    const after = value.slice(ta.selectionStart);
    const newVal = before + item.insertText + after;

    setValue(newVal);
    clearTrigger();

    // restore caret just after inserted text
    const newPos = (before + item.insertText).length;
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = newPos;
    }, 0);
  };

  const clearTrigger = () => {
    setTrigger(null);
    setSuggestions([]);
    setSelectedIndex(0);
  };

  // close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        clearTrigger();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ position: 'relative' }} className="bg-light p-2 rounded">
      {/* {showFunctionMenu && <CommandMenu />} */}
      {/* <button className="btn btn-sm bg-info mb-2 text-light">@ Add Context</button> */}
      <textarea
        ref={textareaRef}
        value={value}
        className="form-control bg-light p-2"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        rows={2}
        style={{ width: '100%', fontSize: 16 }}
        placeholder="Ask me anything, first mention @workspace to add context"
        aria-autocomplete="list"
        aria-expanded={Boolean(suggestions.length)}
        aria-owns="suggestion-list"
      />

      {trigger && suggestions.length > 0 && (
        <ul
          id="suggestion-list"
          role="listbox"
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            width: 240,
            zIndex: 1000,
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => selectSuggestion(s)}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                background: i === selectedIndex ? '#eef' : 'transparent',
              }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- fake data sources ----
async function fetchUsers(token: string) {
  return [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
  ].filter((u) =>
    u.name.toLowerCase().startsWith(token.toLowerCase())
  );
}

async function fetchCommands(token: string) {
  const all = [
    { id: 'c1', command: 'todo', label: 'Create Todo' },
    { id: 'c2', command: 'note', label: 'Add Note' },
    { id: 'c3', command: 'reminder', label: 'Set Reminder' },
  ];
  return all.filter((c) =>
    c.command.toLowerCase().startsWith(token.toLowerCase())
  );
}
