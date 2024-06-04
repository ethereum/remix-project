import React, { useContext, useEffect, useState } from 'react'
import '../remix-ai.css'

export const Default = () => {
  const [searchText, setSearchText] = useState('');
  const [resultText, setResultText] = useState('');

  return (
    <div>
      <div className="remix_ai_plugin_find_container">
        <input
          type="text"
          className="remix_ai_plugin_search-input"
          placeholder="Search..."
          value={searchText}
          onChange={() => console.log('searchText not implememted')}
        />
      </div>
      <div className="remix_ai_plugin_find_container_internal">
        <textarea
          className="remix_ai_plugin_search_result_textbox"
          rows={10}
          cols={50}
          placeholder="Results..."
          value={resultText}
          readOnly
        />
      </div>
      <div className="remix_ai_plugin_find-part">
        <a href="#" className="remix_ai_plugin_search_result_item_title">/fix the problems in my code</a>
        <a href="#" className="remix_ai_plugin_search_result_item_title">/tests add unit tests for my code</a>
        <a href="#" className="remix_ai_plugin_search_result_item_title">/explain how the selected code works</a>
      </div>
    </div>
  );
}