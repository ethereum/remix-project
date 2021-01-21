# Automation

## Activated automations:
 
 - **Out of the box, github automerge** will merge a PR once everything is green. It is activated from a pull request page.
 
   It won't automatically sync (merge or rebase) the branch with master.    
 
   For more [information](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/automatically-merging-a-pull-request).
 
 - **Autosquash** will automatically update the branch - merge commit (when a new commit lands on master).
 
   It will automatically squash and merge to master once everything is green.
   
   It is activated by adding the `autosquash` label. 
 
   For more [information](https://github.com/marketplace/actions/autosquash)
 
 - **Autorebase** will automatically rebase the branch (when a new commit lands on master).
 
   It won't automatically merge to master (this can be done with the first automation).
   
   It is activated by adding the `autorebase` label.
 
   For more [information](https://github.com/marketplace/actions/rebase-pull-requests)
