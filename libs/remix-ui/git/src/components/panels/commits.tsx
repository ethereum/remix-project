import { checkout, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { default as dateFormat } from "dateformat";

export const Commits = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)


    const getDate = (commit: ReadCommitResult) => {
        const date = dateFormat(
            commit.commit.committer.timestamp * 1000,
            "dddd, mmmm dS, yyyy h:MM:ss TT"
        );
        return date;
    };

    const checkout = async (oid: string) => {
        try {
            //await ModalRef.current?.show();
            actions.checkout({ ref: oid })
            //Utils.log("yes");
        } catch (e) {
            //Utils.log("no");
        }
    };

    return (
        <>
            <hr />
            {context.commits && context.commits.length ?
                <div>

                    <div className="container-fluid p-0">
                        {context.commits && context.commits.map((commit) => {
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
                                    <hr></hr>
                                </div>
                            );
                        })}

                        <div
                            onClick={async () => await checkout("main")}
                            className="btn btn-primary btn-sm checkout-btn mt-2 d-none"
                            data-oid="main"
                        >
                            git checkout main
                        </div>
                    </div>
                </div>
                : <div className="text-muted">No commits</div>}
        </>
    )
}