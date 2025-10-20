import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import Keyboard from 'react-simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import type { KeyboardReactInterface } from 'react-simple-keyboard'
import { english } from '../lib/layouts/english'
import { hindi } from '../lib/layouts/hindi'
import { telugu } from '../lib/layouts/telugu'
import { malayalam } from '../lib/layouts/malayalam'
import { tamil } from '../lib/layouts/tamil'

const layouts = { english, hindi, telugu, malayalam, tamil };

// Configure backend API base. In production, set Vercel env VITE_API_BASE to your backend URL.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function KeyboardPage() {
  const [input, setInput] = useState('')
  const [layoutName, setLayoutName] = useState<'default' | 'shift'>('default')
  const keyboardRef = useRef<KeyboardReactInterface | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [language, setLanguage] = useState<keyof typeof layouts>('english');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Fetch suggestions based on input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      const words = input.trim().split(/\s+/);
      const lastWord = words[words.length - 1];
      const hasSpace = input.endsWith(' ');

      try {
        let response;
        if (hasSpace) {
          // After space: predict next word
          response = await fetch(`${API_BASE}/predict/${language}/?user_input=${encodeURIComponent(input.trim())}`);
        } else {
          // While typing: autocomplete current word
          response = await fetch(`${API_BASE}/autocomplete/${language}/?prefix=${encodeURIComponent(lastWord)}`);
        }
        
        const data = await response.json();
        const results = data.suggestions || data.predictions || [];
        setSuggestions(results.slice(0, 3));
        setSelectedSuggestionIndex(0);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [input, language]);

  const acceptSuggestion = useCallback((suggestion: string) => {
    const words = input.trim().split(/\s+/);
    const hasSpace = input.endsWith(' ');
    
    if (hasSpace) {
      // After space: append next word
      const newInput = input + suggestion + ' ';
      setInput(newInput);
      keyboardRef.current?.setInput(newInput);
    } else {
      // Replace last word
      words[words.length - 1] = suggestion;
      const newInput = words.join(' ') + ' ';
      setInput(newInput);
      keyboardRef.current?.setInput(newInput);
    }
    
    setSuggestions([]);
    textareaRef.current?.focus();
  }, [input]);

  const keyboardOptions = useMemo(() => ({
    layoutName,
    layout: layouts[language],
    display: {
      '{bksp}': '⌫',
      '{enter}': '⏎ Enter',
      '{tab}': 'Tab',
      '{lock}': 'Caps',
      '{shift}': 'Shift',
      '{space}': 'Space'
    },
    theme: 'hg-theme-default my-theme',
    buttonTheme: [
      { class: 'hg-highlight', buttons: '{enter} {bksp} {shift} {tab} {lock}' }
    ],
    onChange: (val: string) => setInput(val),
    onKeyPress: (button: string) => {
      if (button === '{shift}' || button === '{lock}') {
        setLayoutName((l) => (l === 'default' ? 'shift' : 'default'))
      }
      if (button === '{tab}' && suggestions.length > 0) {
        acceptSuggestion(suggestions[selectedSuggestionIndex]);
      }
    }
  }), [layoutName, language, suggestions, selectedSuggestionIndex, acceptSuggestion])

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {Object.keys(layouts).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang as keyof typeof layouts)
                setLayoutName('default')
                setInput('')
                keyboardRef.current?.setInput('')
              }}
              className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer ${language === lang ? 'bg-white text-black border-white' : 'bg-black text-white border-white hover:bg-white hover:text-black'}`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              keyboardRef.current?.setInput(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && suggestions.length > 0) {
                e.preventDefault();
                acceptSuggestion(suggestions[selectedSuggestionIndex]);
              }
            }}
            placeholder="Type here or use the keyboard below..."
            className="w-full h-32 border-2 border-white rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-white bg-black text-white placeholder-gray-400 resize-none caret-white"
            style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Malayalam', 'Noto Sans Telugu', sans-serif", position: 'relative', zIndex: 1 }}
          />
          {/* Mirror div for caret position calculation */}
          <div
            id="mirror-div"
            style={{
              position: 'absolute',
              visibility: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: "'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Malayalam', 'Noto Sans Telugu', sans-serif",
              fontSize: '1.125rem', // text-lg
              padding: '0.75rem', // p-3
              border: '2px solid transparent',
              width: '100%',
              minHeight: '8rem', // h-32
              boxSizing: 'border-box',
              background: 'transparent',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            {(() => {
              // Show input up to caret
              if (!textareaRef.current) return input;
              const caret = textareaRef.current.selectionStart || input.length;
              // Insert a marker span at the caret
              const before = input.slice(0, caret);
              const after = input.slice(caret);
              return (
                <>
                  {before}
                  <span id="caret-marker" style={{ display: 'inline-block', width: 0, height: 0 }} />
                  {after}
                </>
              );
            })()}
          </div>
          {suggestions.length > 0 && textareaRef.current && (() => {
            // Find caret position safely
            let left = 0, top = 0;
            const mirror = document.getElementById('mirror-div');
            if (mirror) {
              const marker = mirror.querySelector('#caret-marker');
              if (marker) {
                const rect = marker.getBoundingClientRect();
                const parentRect = mirror.getBoundingClientRect();
                left = rect.left - parentRect.left;
                top = rect.top - parentRect.top;
              } else {
                // fallback: show at top left of textarea
                left = 0;
                top = 0;
              }
            }
            return (
              <div
                className="absolute z-20 flex gap-2 p-2 bg-white border-2 border-white rounded-lg shadow-lg"
                style={{ left: left, top: top - 48, minWidth: 120 }}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => acceptSuggestion(suggestion)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                      index === selectedSuggestionIndex
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
        <div className="rounded-lg border-2 border-white p-2 bg-black">
          <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r)}
            {...keyboardOptions}
          />
        </div>
        <style>{`
          .my-theme.hg-theme-default {
            background: #000000;
            border-radius: 0.5rem;
            font-family: 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Malayalam', 'Noto Sans Telugu', sans-serif;
          }
          .my-theme .hg-button {
            border-radius: 0.375rem;
            background: #000000;
            color: #ffffff;
            border: 1px solid #ffffff;
            height: 45px;
            font-size: 16px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Malayalam', 'Noto Sans Telugu', sans-serif;
          }
          .my-theme .hg-button:hover {
            background: #ffffff;
            color: #000000;
          }
          .my-theme .hg-button:active {
            background: #ffffff;
            color: #000000;
            transform: scale(0.95);
          }
          .my-theme .hg-highlight {
            background: #333333;
            color: #ffffff;
          }
        `}</style>
      </div>
    </div>
  )
}
