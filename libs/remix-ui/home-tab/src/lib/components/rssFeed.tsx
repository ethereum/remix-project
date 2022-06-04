import React, { useState, useEffect } from "react";
import Parser from "rss-parser";
import './rssFeed.css';

interface RSSFeedProps {
    feedUrl: string,
    maxItems: number,
}

export function RSSFeed({ feedUrl, maxItems }: RSSFeedProps) {
    const [feed, setFeed] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const parser = new Parser()
            const feed = await parser.parseURL(feedUrl);
            for (const item of feed.items) {
                item.content = item['content:encoded']
                item.date = new Date(item.pubDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            }
            setFeed(feed);
        };
        fetchData();
    }, [feedUrl]);


    return (<>
        {feed && feed.items.slice(0, maxItems).map((item: any, index: any) => (
            <div className='RSSFeed-item' key={index}>
                <a target="_blank" href={item.link}><h3>{item.title}</h3></a>
                <p>Author: {item.creator}</p>
                <h4>{item.date}</h4>
                <div className="truncate" dangerouslySetInnerHTML={{ __html: item.content }} />
                <a className="more-button btn mb-3" target="_blank" href={item.link}>READ MORE</a>
                <hr></hr>
            </div>
        ))}
    </>)
}