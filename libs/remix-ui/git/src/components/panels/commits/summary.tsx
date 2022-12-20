import { ReadCommitResult } from "isomorphic-git"
import { default as dateFormat } from "dateformat";
import React from "react";

export interface CommitSummaryProps {
  commit: ReadCommitResult;
  checkout: (oid: string) => void;
}

export const CommitSummary = (props: CommitSummaryProps) => {
  const { commit, checkout } = props;

  const getDate = (commit: ReadCommitResult) => {
    const date = dateFormat(
      commit.commit.committer.timestamp * 1000,
      "dddd, mmmm dS, yyyy h:MM:ss TT"
    );
    return date;
  };

  return (
    <div key={commit.oid} className="p-0">
      <div className="font-weight-bold">{commit.commit.message}</div>
      <div className="text-muted small">{commit.commit.author.name || ""}</div>
      <div className="text-muted small">{getDate(commit)}</div>
      <div className="text-truncate text-muted small">{commit.oid}</div>
      <div
        onClick={async () => await checkout(commit.oid)}
        className="btn btn-primary btn-sm checkout-btn ml-0 ml-md-0 w-100"
      >
        git checkout
      </div>
    </div>
  )
}