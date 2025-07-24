

# CircleCI Parameters and Workflows Overview

This project uses **CircleCI pipeline parameters** to control workflows and resources dynamically. Below is a description of the main parameters and their purpose:

## ✅ Boolean Parameters

These are used to enable or disable specific workflows:

- **`run_all_tests`**  
  When `true`, runs the full suite of tests.
- **`run_pr_tests`**  
  When `true`, runs tests tagged with `#pr` or `#PR`.
- **`run_flaky_tests`**  
  When `true`, runs tests tagged with `#flaky`.
- **`run_metamask_tests`**  
  When `true`, runs only the MetaMask-related tests.
- **`windows`, `mac`, `linux`**  
  Used to selectively run OS-specific builds or tests.

## ✅ String Parameters

- **`run_file_tests`**  
  Specifies a specific filename or pattern to run targeted tests.
- **`keyword`**  
  A custom keyword string. When specified, the workflow searches for test files containing this keyword in their filenames. This is used by the `run_custom_keyword_tests` workflow to trigger tests selectively.

## ✅ Enum Parameter

- **`resource_class`**  
  Controls the compute size used for jobs.
  Allowed values:  
  - `medium`  
  - `large`  
  - `xlarge` (default)  
  - `2xlarge`

  This parameter is applied across jobs to adjust resource allocation dynamically. For example, you can trigger a pipeline with:
  ```
  resource_class=2xlarge
  ```
  to speed up builds on more powerful machines.

