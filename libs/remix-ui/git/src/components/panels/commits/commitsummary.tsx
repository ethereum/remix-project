import { ReadCommitResult } from "isomorphic-git"
import { default as dateFormat } from "dateformat";
import React from "react";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { remote } from "@remix-ui/git";
import GitUIButton from "../../buttons/gituibutton";
import { gitPluginContext } from "../../gitui";

export interface CommitSummaryProps {
  commit: ReadCommitResult;
  checkout: (oid: string) => void;
}

export const CommitSummary = (props: CommitSummaryProps) => {
  const { commit, checkout } = props;
  const context = React.useContext(gitPluginContext)

  const getDate = (commit: ReadCommitResult) => {
    const timestamp = commit.commit.author.timestamp;

    if (timestamp) {
      // calculate the difference between the current time and the commit time in days or hours or minutes
      const diff = Math.floor((Date.now() - timestamp * 1000) / 1000 / 60 / 60 / 24);

      if (diff == 0) {
        return "today at " + dateFormat(timestamp * 1000, "HH:MM");
      } else

      if (diff < 1) {
        // return how many hours ago
        return `${Math.floor(diff * 24)} hour(s) ago`;
      }

      if (diff < 7) {
        // return how many days ago
        return `${diff} day(s) ago`;
      }
      if (diff < 365) {
        return dateFormat(timestamp * 1000, "mmm dd");
      }
      return dateFormat(timestamp * 1000, "mmm dd yyyy");
    }
    return "";
  };

  const getRemote = (): remote | null => {
    return context.upstream ? context.upstream : context.defaultRemote ? context.defaultRemote : null
  }

  const openRemote = () => {
    if(getRemote())
    window.open(`${getRemote().url}/commit/${commit.oid}`, '_blank');
  }

  return (
    <>
      <div className="long-and-truncated ml-2">
        {commit.commit.message}
      </div>
      {commit.commit.author.name || ""}
      <span className="ml-1">{getDate(commit)}</span>
      {getRemote() && getRemote()?.url && <GitUIButton className="btn btn-sm p-0 mx-1 text-muted" onClick={() => openRemote()}><FontAwesomeIcon icon={faGlobe} ></FontAwesomeIcon></GitUIButton>}
    </>
  )
}