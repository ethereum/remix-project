export default {
    "Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing \"SPDX-License-Identifier: <SPDX-License>\" to each source file. Use \"SPDX-License-Identifier: UNLICENSED\" for non-open-source code. Please see https://spdx.org for more information.": {
        "title": "Add open-source license",
        "message": "// SPDX-License-Identifier: GPL-3.0"
    },
    "Warning: Source file does not specify required compiler version! Consider adding" : {
        "title": "Add pragma line",
        "message": "pragma solidity ^0.*.*;",
        "range": {
            startLineNumber: 2,
            endLineNumber: 2,
            startColumn: 1,
            endColumn: 1
        }
    }
}