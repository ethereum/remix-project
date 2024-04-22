import { checkout, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { BranchDifferences } from "./branches/branchdifferences";
import { CommitDetails } from "./commits/commitdetails";
import { CommitSummary } from "./commits/commitsummary";


export const Commits = () => {
    const [hasNextPage, setHasNextPage] = React.useState(true)
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)

    const checkout = async (oid: string) => {
        try {
            //await ModalRef.current?.show();
            actions.checkout({ ref: oid })
            //Utils.log("yes");
        } catch (e) {
            //Utils.log("no");
        }
    };

    const loadNextPage = () => {
        console.log('LOAD NEXT PAGE', context.commits.length)
        actions.fetch(null, context.currentBranch.name, null, 5, true, true)
        //actions.getBranchCommits(branch, lastPageNumber+1)
    }

    const getCommitChanges = async (commit: ReadCommitResult) => {
        await actions.getCommitChanges(commit.oid, commit.commit.parent[0])
    }


    return (
        <>
            {context.commits && context.commits.length ?
                <><BranchDifferences branch={context.currentBranch}></BranchDifferences><div>
                    <div className="pt-1">
                        {context.commits && context.commits.map((commit, index) => {
                            return (
                                <CommitDetails getCommitChanges={getCommitChanges} key={index} checkout={checkout} commit={commit}></CommitDetails>
                            );
                        })}
                    </div>
                </div>
                    {hasNextPage && <a href="#" className="cursor-pointer mb-1 ml-2" onClick={loadNextPage}>Load more</a>}
                </>
                : <div className="text-muted">No commits</div>}
        </>
    )
}