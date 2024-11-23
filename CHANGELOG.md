# Changelog
All changes to the project will be documented in this file.

## [1.39.12] - Not Released
* Update SDKs and Roslyn ([#2603](https://github.com/OmniSharp/omnisharp-roslyn/pull/2603))

## [1.39.11] - 2023-12-19
* Update changelog (PR: [#2591](https://github.com/OmniSharp/omnisharp-roslyn/pull/2591))
* Update Readme text and fix broken link. ([#2581](https://github.com/OmniSharp/omnisharp-roslyn/issues/2581), PR: [#2582](https://github.com/OmniSharp/omnisharp-roslyn/pull/2582))
* Update SDKs and dependencies ([#2586](https://github.com/OmniSharp/omnisharp-roslyn/issues/2586), PR: [#2588](https://github.com/OmniSharp/omnisharp-roslyn/pull/2588))
* Updated to latest dotnet-script 1.5.0 (PR: [#2585](https://github.com/OmniSharp/omnisharp-roslyn/pull/2585))

## [1.39.10] - 2023-10-05
* Add RazorComplier EA to support razor generators (PR: [#2572](https://github.com/OmniSharp/omnisharp-roslyn/pull/2572))

## [1.39.9] - 2023-10-04
* Add Kind parameter to InlayHint (PR: [#2570](https://github.dev/OmniSharp/omnisharp-roslyn/pull/2570))
* Do not include commit characters if the typed span is empty (PR: [#2569](https://github.com/OmniSharp/omnisharp-roslyn/pull/2569))
* Update Roslyn to version 4.9.0-1.23504.3 (PR: [#2567](https://github.com/OmniSharp/omnisharp-roslyn/pull/2567))
* Async diagnostics analyzer work queue (PR: [#2351](https://github.com/OmniSharp/omnisharp-roslyn/pull/2351))
* Add InlayHint implementation to OmniSharp.LSP (PR: [#2566](https://github.com/OmniSharp/omnisharp-roslyn/pull/2566))
* Include the project file name when invoking `dotnet build` (PR: [#2565](https://github.com/OmniSharp/omnisharp-roslyn/pull/2565))
* feat: ignore diagnostics for generated code (PR: [#2509](https://github.com/OmniSharp/omnisharp-roslyn/pull/2509))
* Update documentation to reflect --stdio flag deprecation (#2439) (PR: [#2554](https://github.com/OmniSharp/omnisharp-roslyn/pull/2554))
* Update Roslyn to version 4.8.0-1.23374.10 (PR: [#2555](https://github.com/OmniSharp/omnisharp-roslyn/pull/2555))
* Use double quote when quoting un script path (PR: [#2553](https://github.com/OmniSharp/omnisharp-roslyn/pull/2553))

## [1.39.8] - 2023-07-17
* Use core LSP TokenTypes where possible and validate token names (PR: [#2548](https://github.com/OmniSharp/omnisharp-roslyn/pull/2548))

## [1.39.7] - 2023-06-16
* Respond to breaking change in VSCode 1.79.2 in completion (PR:[#2542](https://github.com/OmniSharp/omnisharp-roslyn/pull/2542))
* Use dotnet-cake for build (PR:[#2537](https://github.com/OmniSharp/omnisharp-roslyn/pull/2537))
* Implement LSP CodeAction resolve (PR:[#2467](https://github.com/OmniSharp/omnisharp-roslyn/pull/2467))

## [1.39.6] - 2023-03-14
* Use new VS threading version to match with Razor (PR:[#2518](https://github.com/OmniSharp/omnisharp-roslyn/pull/2518))

## [1.39.5] - 2023-03-09
* Update to Roslyn `4.6.0-3.23153.5` (PR:[#2511](https://github.com/OmniSharp/omnisharp-roslyn/pull/2511))
* Report to the client if the project being loaded is sdk style (PR:[#2502](https://github.com/OmniSharp/omnisharp-roslyn/pull/2502))

## [1.39.4] - 2023-01-18
* Disable snippets in sync completion (PR: [#2497](https://github.com/OmniSharp/omnisharp-roslyn/pull/2497))

## [1.39.3] - 2023-01-03
* Update Roslyn to 4.5.0-2.22527.10 (PR: [#2486](https://github.com/OmniSharp/omnisharp-roslyn/pull/2486))
* Update dotnet-script dependencies to 1.4.0 (PR: [#2477](https://github.com/OmniSharp/omnisharp-roslyn/pull/2477))
* Register the LanguageServerLogger only once (PR: [#2473](https://github.com/OmniSharp/omnisharp-roslyn/pull/2473))

## [1.39.2] - 2022-10-26
* Add missing LSP Handlers (PR: [#2463](https://github.com/OmniSharp/omnisharp-roslyn/pull/2463))
* Add the TypeDefinitionHandler to the LSP (PR: [#2461](https://github.com/OmniSharp/omnisharp-roslyn/pull/2461))
* Update .NET SDK and Roslyn (PR: [#2458](https://github.com/OmniSharp/omnisharp-roslyn/pull/2458))
* Don't remap line mappings in Razor files (PR: [#2460](https://github.com/OmniSharp/omnisharp-roslyn/pull/2460))
* Adds missing /open endpoint to Cake (PR: [#2457](https://github.com/OmniSharp/omnisharp-roslyn/pull/2457))
* Adds V2 Highlight support to Cake (PR: [#2456](https://github.com/OmniSharp/omnisharp-roslyn/pull/2456))
* Include Cake bits in .NET 6 builds (PR: [#2455](https://github.com/OmniSharp/omnisharp-roslyn/pull/2455))
* Host dependency cleanup (PR: [#2436](https://github.com/OmniSharp/omnisharp-roslyn/pull/2436))
* Upgrade http driver to latest ASP.NET Core version when running in .NET 6 (PR: [#2446](https://github.com/OmniSharp/omnisharp-roslyn/pull/2446))
* updated IL Spy to 7.2.1.6856 (PR: [#2447](https://github.com/OmniSharp/omnisharp-roslyn/pull/2447))
* Add comment to app.config explaining System.Memory versioning (PR: [#2444](https://github.com/OmniSharp/omnisharp-roslyn/pull/2444))
* Add explicit System.Memory dependency to Hosts (PR: [#2443](https://github.com/OmniSharp/omnisharp-roslyn/pull/2443))
* Return generated file info for find references (PR: [#2434](https://github.com/OmniSharp/omnisharp-roslyn/pull/2434))
* Support NUnit TheoryAttribute (PR: [#2435](https://github.com/OmniSharp/omnisharp-roslyn/pull/2435))
* Provide SourceGeneratedFileInfo for workspace symbolls requests (PR: [#2431](https://github.com/OmniSharp/omnisharp-roslyn/pull/2431))
* Take the first dotnet cli we find instead of the last one we find (match the comment) (PR: [#2427](https://github.com/OmniSharp/omnisharp-roslyn/pull/2427)]
* Record whether a CodeAction is a fix or not (PR: [#2430](https://github.com/OmniSharp/omnisharp-roslyn/pull/2430))
* Update VMs used in build CI. (PR: [#2425](https://github.com/OmniSharp/omnisharp-roslyn/pull/2425))
* Only get first document's highlights (PR: [#2424](https://github.com/OmniSharp/omnisharp-roslyn/pull/2424))

## [1.39.1] - 2022-07-25
* Update Roslyn to 4.4.0 1.22369.1 (PR: [#2420](https://github.com/OmniSharp/omnisharp-roslyn/pull/2420))
* Simplify some code (PR: [#2370](https://github.com/OmniSharp/omnisharp-roslyn/pull/2370))
* Return meaningful error when pinned SDK version is not found. ([[omnisharp-vscode#5128](https://github.com/OmniSharp/omnisharp-vscode/issues/5128), PR: [#2403](https://github.com/OmniSharp/omnisharp-roslyn/pull/2403))
* Added support for `<WarningsAsErrors>nullable</WarningsAsErrors>` ([#2292](https://github.com/OmniSharp/omnisharp-roslyn/issues/2292), PR: [#2406](https://github.com/OmniSharp/omnisharp-roslyn/pull/2406))
* Removed nuget versioning reference from OmniSharp.Abstractions ([#2410](https://github.com/OmniSharp/omnisharp-roslyn/issues/2410), PR: [#2414](https://github.com/OmniSharp/omnisharp-roslyn/pull/2414))
* Bump Newtonsoft.Json to 13.0.1 (PR: [#2415](https://github.com/OmniSharp/omnisharp-roslyn/pull/2415))

## [1.39.0] - 2022-05-19
* Update Roslyn to 4.3.0-2.22267.5 (PR: [#2401](https://github.com/OmniSharp/omnisharp-roslyn/pull/2401))
* Fixed run script for Mono ([omnisharp-vscode#5181](https://github.com/OmniSharp/omnisharp-vscode/issues/5181), [omnisharp-vscode#5179](https://github.com/OmniSharp/omnisharp-vscode/issues/5179), PR: [#2398](https://github.com/OmniSharp/omnisharp-roslyn/pull/2398))
* Fall back to /usr/lib/os-release if /etc/os-release doesn't exist (PR: [#2380](https://github.com/OmniSharp/omnisharp-roslyn/pull/2380))
* Added support for linux-musl-x64 and linux-musl-arm64 ([#2366](https://github.com/OmniSharp/omnisharp-roslyn/issues/2366), PR: [#2395](https://github.com/OmniSharp/omnisharp-roslyn/pull/2395))
* Enable GoToDefinition for symbols in metadata documents ([omnisharp-vscode#4818](https://github.com/OmniSharp/omnisharp-vscode/issues/4818), PR: [#2390](https://github.com/OmniSharp/omnisharp-roslyn/pull/2390))
* Use human readable doc in lsp's signature help ([#2372](https://github.com/OmniSharp/omnisharp-roslyn/issues/2372), PR: [#2392](https://github.com/OmniSharp/omnisharp-roslyn/pull/2392))
* Add TextEdits support to InlayHints (PR: [#2385](https://github.com/OmniSharp/omnisharp-roslyn/pull/2385))
* Fix Equals of AutoCompleteResponse and simplify some code (PR: [#2362](https://github.com/OmniSharp/omnisharp-roslyn/pull/2362))
* Support O# running on .NET 7 SDKs (PR: [#2377](https://github.com/OmniSharp/omnisharp-roslyn/pull/2377))
* Provide constructor accepting hostServices (PR: [#2373](https://github.com/OmniSharp/omnisharp-roslyn/pull/2373))
* Typo fix ([#2374](https://github.com/OmniSharp/omnisharp-roslyn/pull/2374))
* Update to latest .NET SDKs (PR: [#2378](https://github.com/OmniSharp/omnisharp-roslyn/pull/2378))
* Remove MSBuild and Mono from release packages ([#2339](https://github.com/OmniSharp/omnisharp-roslyn/issues/2339), PR: [#2360](https://github.com/OmniSharp/omnisharp-roslyn/pull/2360))

## [1.38.2] - 2022-03-22
* Add analyze open documents only (PR: [#2346](https://github.com/OmniSharp/omnisharp-roslyn/pull/2346))
* Create a new GoToTypeDefinition endpoint ([#2297](https://github.com/OmniSharp/omnisharp-roslyn/issues/2297), PR: [#2315](https://github.com/OmniSharp/omnisharp-roslyn/pull/2315))
* Eliminate more instances of IWorkspaceOptionsProvider (PR: [#2343](https://github.com/OmniSharp/omnisharp-roslyn/pull/2343))
* Update Build.md brew cask instructions (PR: [#2355](https://github.com/OmniSharp/omnisharp-roslyn/pull/2355))
* Remove not used middleware extension methods and unify adding middleware (PR: [#2340](https://github.com/OmniSharp/omnisharp-roslyn/pull/2340))
* Pass --overwrite when pushing build artifacts to azure (PR: [#2358](https://github.com/OmniSharp/omnisharp-roslyn/pull/2358))
* Delete System.Configuration.ConfigurationManager from deployed packages ([omnisharp-vscode#5113](https://github.com/OmniSharp/omnisharp-vscode/issues/5113), PR: [#2359](https://github.com/OmniSharp/omnisharp-roslyn/pull/2359))
* Support inlay hints (PR: [#2357](https://github.com/OmniSharp/omnisharp-roslyn/pull/2357))
* Update build tools to match .NET SDK 6.0.201 ([#2363](https://github.com/OmniSharp/omnisharp-roslyn/pull/2363))

## [1.38.1] - 2022-02-18
* Reuse Roslyn's analyzer assembly loader (PR: [#2236](https://github.com/OmniSharp/omnisharp-roslyn/pull/2236))
* Pass Completion, Rename and Block Structure options directly instead of updating the Workspace (PR: [#2306](https://github.com/OmniSharp/omnisharp-roslyn/pull/2306))
* Update included build tool to match the current 6.0.200 sdk (PR: [#2329](https://github.com/OmniSharp/omnisharp-roslyn/pull/2329))
* Fix concurrency issue in CSharpDiagnosticWorker (PR: [#2333](https://github.com/OmniSharp/omnisharp-roslyn/pull/2333))
* run analyzers on multiple threads if allowed to (PR: [#2285](https://github.com/OmniSharp/omnisharp-roslyn/pull/2285))
* Add MSBuild project to solution and apply the change to Roslyn workspace as a unit (PR: [#2314](https://github.com/OmniSharp/omnisharp-roslyn/pull/2314))
* Updated to Roslyn 4.0.1 (PR: [#2323](https://github.com/OmniSharp/omnisharp-roslyn/pull/2323))
* Enable OmniSharp.Cake tests for .NET 6 (PR: [#2307](https://github.com/OmniSharp/omnisharp-roslyn/pull/2307))
* Handle completions with trailing whitespace on previous lines (PR: [#2319](https://github.com/OmniSharp/omnisharp-roslyn/pull/2319))
* Update build bools to match .NET SDK 6.0.200 (PR: [#2347](https://github.com/OmniSharp/omnisharp-roslyn/pull/2347))

## [1.38.0] - 2021-12-15
* Build OmniSharp servers that run on .NET 6 SDK (PR: [2291](https://github.com/OmniSharp/omnisharp-roslyn/pull/2291))
* Allow net6 build of O# to load newer .NET SDKs (PR: [#2308](https://github.com/OmniSharp/omnisharp-roslyn/pull/2308))
* Allow alternate versions of documents to be Semantically Highlighted (PR: [#2304](https://github.com/OmniSharp/omnisharp-roslyn/pull/2304))
* Pass the logger for loading projects. So errors occur in loading projects can be printed out. ([omnisharp-vscode#4832](https://github.com/OmniSharp/omnisharp-vscode/issues/4832), PR: [#2288](https://github.com/OmniSharp/omnisharp-roslyn/pull/2288))
* Update OmniSharp.Cake dependencies (PR: [#2280](https://github.com/OmniSharp/omnisharp-roslyn/pull/2280))
* Ensure each published platform uses matching hostfxr library (PR: [#2272](https://github.com/OmniSharp/omnisharp-roslyn/pull/2272))
* Produce an Arm64 build for Linux (PR: [#2271](https://github.com/OmniSharp/omnisharp-roslyn/pull/2271))
* Use 6.0.100 SDK for building (PR: [#2269](https://github.com/OmniSharp/omnisharp-roslyn/pull/2269))
* Added Code of Conduct (PR: [#2266](https://github.com/OmniSharp/omnisharp-roslyn/pull/2266))
* Improved Cake/CSX info messages (PR: [#2264](https://github.com/OmniSharp/omnisharp-roslyn/pull/2264))

## [1.37.17] - 2021-11-02
* Update versions to match dotnet SDK 6.0.1xx (PR: [#2262](https://github.com/OmniSharp/omnisharp-roslyn/pull/2262))
* Remove all completion commit characters in suggestion mode. ([#1974](https://github.com/OmniSharp/omnisharp-vscode/issues/1974), [#3219](https://github.com/OmniSharp/omnisharp-vscode/issues/3219), [#3647](https://github.com/OmniSharp/omnisharp-vscode/issues/3647), [#4833](https://github.com/OmniSharp/omnisharp-vscode/issues/4833), PR: [#2253](https://github.com/OmniSharp/omnisharp-roslyn/pull/2253))
* fixed logging interpolation in ProjectManager (PR: [#2246](https://github.com/OmniSharp/omnisharp-roslyn/pull/2246))
* Support signature help for implicit object creation ([#2243](https://github.com/OmniSharp/omnisharp-roslyn/issues/2243), PR: [#2244](https://github.com/OmniSharp/omnisharp-roslyn/pull/2244))
* Implement /v2/gotodefinition for Cake ([#2209](https://github.com/OmniSharp/omnisharp-roslyn/issues/2209), PR: [#2212](https://github.com/OmniSharp/omnisharp-roslyn/pull/2212))

## [1.37.16] - 2021-10-01
*  Update included Build Tools to match .NET SDK 6 (PR: [#2239](https://github.com/OmniSharp/omnisharp-roslyn/pull/2239))
* Add Custom .NET CLI support to OmniSharp (PR: [#2227](https://github.com/OmniSharp/omnisharp-roslyn/pull/2227))
* Handle .editorconfig changes without running a new design time build ([#2112](https://github.com/OmniSharp/omnisharp-roslyn/issues/2112) PR: [#2234](https://github.com/OmniSharp/omnisharp-roslyn/pull/2234))
* Do not return nulls when getting documents by path ([#2125](https://github.com/OmniSharp/omnisharp-roslyn/issues/2125) PR: [#2233](https://github.com/OmniSharp/omnisharp-roslyn/pull/2233))
* handle RecordStructName in semantic highlighting classification ([#2228](https://github.com/OmniSharp/omnisharp-roslyn/issues/2228) PR: [#2232](https://github.com/OmniSharp/omnisharp-roslyn/pull/2232))
* Update CodeStructureService with FileScoped Namespace support ([#2225](https://github.com/OmniSharp/omnisharp-roslyn/issues/2225) PR: [#2226](https://github.com/OmniSharp/omnisharp-roslyn/pull/2226))

## [1.37.15] - 2021-08-31
* Update Roslyn to 4.0.0-4.21427.11 (PR: [#2220](https://github.com/OmniSharp/omnisharp-roslyn/pull/2220))
* Update NuGet to 5.10.0 ([#2027](https://github.com/OmniSharp/omnisharp-roslyn/issues/2027), PR: [#2034](https://github.com/OmniSharp/omnisharp-roslyn/pull/2034))
* Remove .NET Core 2.1 (PR: [#2219](https://github.com/OmniSharp/omnisharp-roslyn/pull/2219))
* Update versions to match .NET SDK 6 RC1 (PR: [#2217](https://github.com/OmniSharp/omnisharp-roslyn/pull/2217))
* Use FullPaths for Locations that are returned with relative paths. ([#2215](https://github.com/OmniSharp/omnisharp-roslyn/issues/2215), PR: [#2216](https://github.com/OmniSharp/omnisharp-roslyn/pull/2216))
* Improved logging in project manager (PR: [#2203](https://github.com/OmniSharp/omnisharp-roslyn/pull/2203))
* Log a warning when external features path has no assemblies ([#2201](https://github.com/OmniSharp/omnisharp-roslyn/issues/2201), PR: [#2202](https://github.com/OmniSharp/omnisharp-roslyn/pull/2202))

## [1.37.14] - 2021-07-27
* Update to latest .NET SDKs (PR: [#2197](https://github.com/OmniSharp/omnisharp-roslyn/pull/2197))
* Update included Build Tools to match .NET SDK 6 Preview 7 (PR: [#2196](https://github.com/OmniSharp/omnisharp-roslyn/pull/2196))
* Upgrade McMaster.Extensions.CommandLineUtils to 3.1.0 ([omnisharp-vscode#4090](https://github.com/OmniSharp/omnisharp-vscode/issues/4090), PR: [#2192](https://github.com/OmniSharp/omnisharp-roslyn/pull/2192))

## [1.37.13] - 2021-07-16
* Update Roslyn to 4.0.0-2.21354.7 (PR: [#2189](https://github.com/OmniSharp/omnisharp-roslyn/pull/2189))
* Update included Build Tools to match .NET SDK 6 Preview 6 (PR: [#2187](https://github.com/OmniSharp/omnisharp-roslyn/pull/2187))

## [1.37.12] - 2021-07-09
* Generate binary redirects for OmniSharp libraries (PR: [#2185](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2185))
* Update Roslyn to 4.0.0-2.21322.50 (PR: [#2183](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2183))
* Added support for diagnostic suppressors ([#1711](https://github.com/OmniSharp/omnisharp-roslyn/issues/1711), PR: [#2182](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2182))
* Use the Microsoft.Build.Locator package for discovery (PR: [#2181](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2181))
* fixed Cake test following the auto merge of #2175 (PR: [#2176](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2176))
* Update build tools to match NET 6 Preview 5 (PR: [#2175](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2175))

## [1.37.11] - 2021-06-18
* Include timing info in logged responses (PR: [#2173](https://www.github.com/omnisharp/omnisharp-roslyn/pull/2173))
* Defend against null value in BuildErrorEventArgs ([#2171](https://github.com/OmniSharp/omnisharp-roslyn/issues/2171), PR: [#2172](https://www.github.com/omnisharp/omnisharp-roslyn/pull/2172))
* Updated to all the latest .NET SDKs (PR: [#2166](https://www.github.com/omnisharp/omnisharp-roslyn/pull/2166))
* Add support for GoToDefinition on source-generated files (PR: [#2170](https://www.github.com/omnisharp/omnisharp-roslyn/pull/2170))
* Add V2 version of GotoDefinitionService (PR: [#2168](https://www.github.com/omnisharp/omnisharp-roslyn/pull/2168))
* avoid NRE when document is null (PR: [#2163](https://www.github.com/omnisharp/omnisharp-roslyn/pull/2163)))

## [1.37.10] - 2021-05-25
* Update included toolset to match .NET 6 preview4 (PR: [#2159](https://github.com/OmniSharp/omnisharp-roslyn/pull/2159))

## [1.37.9] - 2021-05-17
* Add async completion support (PR: [#1986](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/1986))
* Only subscribe to AppDomain.AssemblyResolve once (PR: [#2149](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2149))
* Update build tools to match .NET 6 Preview 3 SDK. (PR: [#2134](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2134))
* Do not return null responses from BlockStructureService and CodeStructureService (PR: [#2148](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2148))
* Strong-name sign OmniSharp assemblies (PR: [#2143](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2143))
* Updated IL Spy to 7.0.0 stable (PR: [#2142](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2142))
* Do not crash on startup when configuration is invalid (PR: [#2140](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2140))
* Bump System.Text.Encodings.Web from 4.7.1 to 4.7.2 in /tools (PR: [#2137](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2137))
* Correctly set compilation platform of the project (PR: [#2135](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2135))
* Fix typo (PR: [#2098](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2098))
* Rework completion resolution ([#2123](https://github.com/OmniSharp/omnisharp-roslyn/issues/2123), PR: [#2126](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2126))
* Report back the solution filter name in workspace updated event (PR: [#2130](https://www.github.com/OmniSharp/omnisharp-roslyn/pull/2130))

## [1.37.8] - 2021-03-27
* Support Solution filter (.slnf) (PR: [#2121](https://github.com/OmniSharp/omnisharp-roslyn/pull/2121))
* updated to IL Spy 7.0.0.6372 (PR: [#2113](https://github.com/OmniSharp/omnisharp-roslyn/pull/2113))
* Add sentinel file to MSBuild to enable workload resolver ([omnisharp-vscode#4417](https://github.com/OmniSharp/omnisharp-vscode/issues/4417), PR: [#2111](https://github.com/OmniSharp/omnisharp-roslyn/pull/2111))
* fixed CS8605 "Unboxing possibly null value" (PR: [#2108](https://github.com/OmniSharp/omnisharp-roslyn/pull/2108))
* fixed a 1.37.7 regression: added binding redirects for System.Threading.Tasks.Dataflow (PR: [#2107](https://github.com/OmniSharp/omnisharp-roslyn/pull/2107))

## [1.37.7] - 2021-03-04
* Update Roslyn version to `3.10.0-1.21125.6` (PR: [#2105](https://github.com/OmniSharp/omnisharp-roslyn/pull/2105))
* Update included build tools to closely match NET 6 Preview 1 SDK (PR: [#2103](https://github.com/OmniSharp/omnisharp-roslyn/pull/2103))
* Updated to latest lsp version (PR: [#2099](https://github.com/OmniSharp/omnisharp-roslyn/pull/2099))
* Improve custom error messages for MSB3644 (PR: [#2097](https://github.com/OmniSharp/omnisharp-roslyn/pull/2097))
* Do not call FindReferencesAsync for null symbol ([#2054](https://github.com/OmniSharp/omnisharp-roslyn/issues/2054), PR: [#2089](https://github.com/OmniSharp/omnisharp-roslyn/pull/2089))
* Move LSP Completion to the new CompletionService (PR: [#2074](https://github.com/OmniSharp/omnisharp-roslyn/pull/2074))
* use an OmniSharp specific message for MSB3644 ([#2029](https://github.com/OmniSharp/omnisharp-roslyn/issues/2029), PR: [#2069](https://github.com/OmniSharp/omnisharp-roslyn/pull/2069))
* changed the default RunFixAllRequest timeout to 10 seconds (PR: [#2066](https://github.com/OmniSharp/omnisharp-roslyn/pull/2066))

## [1.37.6] - 2021-01-19
* Handle records in syntax highlighting ([#2048](https://github.com/OmniSharp/omnisharp-roslyn/issues/2048), PR: [#2049](https://github.com/OmniSharp/omnisharp-roslyn/pull/2049))
* Remove formatting on new line (PR: [#2053](https://github.com/OmniSharp/omnisharp-roslyn/pull/2053))
* Validate highlighting ranges in semantic highlighting requests (PR: [#2055](https://github.com/OmniSharp/omnisharp-roslyn/pull/2055))
* Delay project system init to avoid solution update race (PR: [#2057](https://github.com/OmniSharp/omnisharp-roslyn/pull/2057))
* Use "variable" kind for parameter completion ([#2060](https://github.com/OmniSharp/omnisharp-roslyn/issues/2060), PR: [#2061](https://github.com/OmniSharp/omnisharp-roslyn/pull/2061))
* Log request when response fails ([#2064](https://github.com/OmniSharp/omnisharp-roslyn/pull/2064))

## [1.37.5] - 2020-12-16
* Update Roslyn version to 3.9.0-2.20570.24 (PR: [#2022](https://github.com/OmniSharp/omnisharp-roslyn/pull/2022))
* Gracefully handle GitVersion failure, and set a default version. (PR: [#2030](https://github.com/OmniSharp/omnisharp-roslyn/pull/2030))
* Editorconfig improvements - do not lose state, trigger re-analysis on change ([#1955](https://github.com/OmniSharp/omnisharp-roslyn/issues/1955), [omnisharp-vscode#4165](https://github.com/OmniSharp/omnisharp-vscode/issues/4165), [omnisharp-vscode#4184](https://github.com/OmniSharp/omnisharp-vscode/issues/4184), PR: [#2028](https://github.com/OmniSharp/omnisharp-roslyn/pull/2028))
* Add documentation comment creation to the FormatAfterKeystrokeService (PR: [#2023](https://github.com/OmniSharp/omnisharp-roslyn/pull/2023))
* Raise default GotoDefinitionRequest timeout from 2s to 10s ([omnisharp-vscode#4260](https://github.com/OmniSharp/omnisharp-vscode/issues/4260), PR: [#2032](https://github.com/OmniSharp/omnisharp-roslyn/pull/2032))
* Register languageServer as ILanguageServerFacade (PR: [#2025](https://github.com/OmniSharp/omnisharp-roslyn/pull/2025))
* Workspace create file workaround (PR: [#2019](https://github.com/OmniSharp/omnisharp-roslyn/pull/2019))
* Added `msbuild:UseBundledOnly` option to force the usage of bundled MSBuild (PR: [#2038](https://github.com/OmniSharp/omnisharp-roslyn/pull/2038))
* Build NetCoreApp2.1 test project with .NET Core SDK 2.1 (PR: [#2040](https://github.com/OmniSharp/omnisharp-roslyn/pull/2040))

## [1.37.4] - 2020-11-20
* Fixed global Mono MSBuild version reporting (PR: [#1988](https://github.com/OmniSharp/omnisharp-roslyn/pull/1988))
* Fixed incremental changes and completion in Cake (PR: [#1997](https://github.com/OmniSharp/omnisharp-roslyn/pull/1997))
* Omnisharp now uses libPaths and sourcePaths defined in custom .rsp file for scripting (PR: [#2000](https://github.com/OmniSharp/omnisharp-roslyn/pull/2000))
* C# scripting should use language version "latest" by default (PR: [#2001](https://github.com/OmniSharp/omnisharp-roslyn/pull/2001))
* Fixed null references in LSP mode when requests are handled before the server fully initializes ([#1742](https://github.com/OmniSharp/omnisharp-roslyn/issues/1742https://github.com/OmniSharp/omnisharp-roslyn/issues/1742), [#1515](https://github.com/OmniSharp/omnisharp-roslyn/issues/1515), [#1083](https://github.com/OmniSharp/omnisharp-roslyn/issues/1083), PR: [#2005](https://github.com/OmniSharp/omnisharp-roslyn/pull/2005))
* Fixed logging in LSP mode (PR: [#2002](https://github.com/OmniSharp/omnisharp-roslyn/pull/2002))
* Upgraded LSP mode to `OmniSharp.Extensions.LanguageServer 0.18.3` (PR: [#1998](https://github.com/OmniSharp/omnisharp-roslyn/pull/1998))
* Improve handling with Cake Script Service (PR: [#2013](https://github.com/OmniSharp/omnisharp-roslyn/pull/2013))
* Updated to latest Dotnet.Script scripting packages for .NET 5.0 ([#2020](https://github.com/OmniSharp/omnisharp-roslyn/issues/2020), PR: [#2012](https://github.com/OmniSharp/omnisharp-roslyn/pull/2012))
* Updated Roslyn to `3.8.0`, MSBuild to `16.8.0`, DotNetHostResolver to `5.0.0`, Nuget packages to `5.8.0-rc.6930` and MSBuildSDKResolver to `5.0.101-servicing.20564.2` to match .NET 5.0.100 SDK (PR: [#2015](https://github.com/OmniSharp/omnisharp-roslyn/pull/2015), [#2016](https://github.com/OmniSharp/omnisharp-roslyn/pull/2016))
* Workspace create file workaround for VS Code (to avoid race condtion on newly created files) ([omnisharp-vscode#4181](https://github.com/OmniSharp/omnisharp-vscode/issues/4181), PR: [#2019](https://github.com/OmniSharp/omnisharp-roslyn/pull/2019))
* Response file can now used enviroment variables in the path + more error handling (PR: [#2008](https://github.com/OmniSharp/omnisharp-roslyn/pull/2008))

## [1.37.3] - 2020-10-14
* Fixed a bug when the server wouldn't start on MacOS/Linux when a username contained a space (PR: [#1979](https://github.com/OmniSharp/omnisharp-roslyn/pull/1979))
* Update to Mono 6.12.0 (PR: [#1981](https://github.com/OmniSharp/omnisharp-roslyn/pull/1981))
* Fix responsiveness regression with targeted DiagnosticWorker revert ([#1982](https://github.com/OmniSharp/omnisharp-roslyn/issues/1982), [#1983](https://github.com/OmniSharp/omnisharp-roslyn/issues/1983), PR: [#1984](https://github.com/OmniSharp/omnisharp-roslyn/pull/1984))

## [1.37.2] - 2020-10-09
* Updated MSBuild, MSBuild resolvers and Roslyn to match .NET Core 5.0 RC2 and VS 16.8 Preview 4. (PR: [#1971](https://github.com/OmniSharp/omnisharp-roslyn/pull/1971), PR: [#1974](https://github.com/OmniSharp/omnisharp-roslyn/pull/1974))
* Decouple FixAll from the workspace ([#1960](https://github.com/OmniSharp/omnisharp-roslyn/issues/1960), PR: [#1962](https://github.com/OmniSharp/omnisharp-roslyn/pull/1962))
* Added binding redirects for Microsoft.CodeAnalysis.Features and Microsoft.CodeAnalysis.CSharp.Features (PR: [#1964](https://github.com/OmniSharp/omnisharp-roslyn/pull/1964))
* Always log error responses with error level (PR: [#1963](https://github.com/OmniSharp/omnisharp-roslyn/pull/1963))
* Added support for override property completion. **Warning**: contains breaking change, as `InsertText` was removed from the response, please use `TextEdit` instead (PR: [#1957](https://github.com/OmniSharp/omnisharp-roslyn/pull/1957))
* Correctly handle <ProjectReferences> that don't produce references (PR: [#1956](https://github.com/OmniSharp/omnisharp-roslyn/pull/1956))
* Marked `/autocomplete` endpoint as obsolete - the clients should be switching to `/completion` and `/completion/resolve` (PR: [#1951](https://github.com/OmniSharp/omnisharp-roslyn/pull/1951))
* Fixed escapes in regex completions ([#1949](https://github.com/OmniSharp/omnisharp-roslyn/issues/1949), PR: [#1950](https://github.com/OmniSharp/omnisharp-roslyn/pull/1950))
* Fixed completion on part of existing string ([omnisharp-vscode#4063](https://github.com/OmniSharp/omnisharp-vscode/issues/4063), PR: [#1941](https://github.com/OmniSharp/omnisharp-roslyn/pull/1941))
* Fixed LSP completion item kinds (PR: [#1940](https://github.com/OmniSharp/omnisharp-roslyn/pull/1940))
* Added support for textDocument/implementation in LSP mode (PR: [#1970](https://github.com/OmniSharp/omnisharp-roslyn/pull/1970))
* Fixed namespace icon in completion response ([omnisharp-vscode#4051](https://github.com/OmniSharp/omnisharp-vscode/issues/4051), PR: [#1936](https://github.com/OmniSharp/omnisharp-roslyn/pull/1936))
* Improved performance of find implementations (PR: [#1935](https://github.com/OmniSharp/omnisharp-roslyn/pull/1935))
* Add support for new quick info endpoint when working with Cake (PR: [#1945](https://github.com/OmniSharp/omnisharp-roslyn/pull/1945))
* Add support for new completion endpoints when working with Cake ([#1939](https://github.com/OmniSharp/omnisharp-roslyn/issues/1939), PR: [#1944](https://github.com/OmniSharp/omnisharp-roslyn/pull/1944))
* When an analyzer fails to load, log an error (PR: [#1972](https://github.com/OmniSharp/omnisharp-roslyn/pull/1972))
* Added support for 'extract base class' (PR: [#1969](https://github.com/OmniSharp/omnisharp-roslyn/pull/1969))
* OmniSharp.Path can only be set in user settings (PR: [#1946](https://github.com/OmniSharp/omnisharp-roslyn/pull/1946))
* Add support for code actions besides ApplyChangesOperation's (PR: [#1724](https://github.com/OmniSharp/omnisharp-roslyn/pull/1724))

## [1.37.1] - 2020-09-01
* Ensure that all quickinfo sections have linebreaks between them, and don't add unecessary duplicate linebreaks (PR: [#1900](https://github.com/OmniSharp/omnisharp-roslyn/pull/1900))
* Support completion of unimported types (PR: [#1896](https://github.com/OmniSharp/omnisharp-roslyn/pull/1896))
* Exclude Misc project from InternalsVisibleTo completion (PR: [#1902](https://github.com/OmniSharp/omnisharp-roslyn/pull/1902))
* Ensure unimported things are sorted after imported things (PR: [#1903](https://github.com/OmniSharp/omnisharp-roslyn/pull/1903))
* Updated lsp library to fix issue with signature help, etc ([#1887](https://github.com/OmniSharp/omnisharp-roslyn/issues/1887), PR: [#1890](https://github.com/OmniSharp/omnisharp-roslyn/pull/1890))
* Correctly handle multiple reference aliases (PR: [#1905](https://github.com/OmniSharp/omnisharp-roslyn/pull/1905))
* Better handle completion when the display text is not in the final result (PR: [#1908](https://github.com/OmniSharp/omnisharp-roslyn/pull/1908))
* Correctly mark hover markup content as markdown ([#1906](https://github.com/OmniSharp/omnisharp-roslyn/issues/1906), PR: [#1909](https://github.com/OmniSharp/omnisharp-roslyn/pull/1909))
* Upgrade lsp ([#1898](https://github.com/OmniSharp/omnisharp-roslyn/issues/1898), PR: [#1911](https://github.com/OmniSharp/omnisharp-roslyn/pull/1911))
* Updated to ILSpy 6.1.0.5902 (PR: [#1913](https://github.com/OmniSharp/omnisharp-roslyn/pull/1913))
* Updated to NET 5.0 preview8 (PR: [#1916](https://github.com/OmniSharp/omnisharp-roslyn/pull/1916))
* Add HTTP Driver back to build.json (PR: [#1918](https://github.com/OmniSharp/omnisharp-roslyn/pull/1918))
* Use ExecutionPolicy Bypass when running powershell.exe (PR: [#1917](https://github.com/OmniSharp/omnisharp-roslyn/pull/1917))
* Update the package that Arch Linux users need to install (PR: [#1921](https://github.com/OmniSharp/omnisharp-roslyn/pull/1921))
* Updated the docs to mention .NET 4.7.2 targeting pack (PR: [#1922](https://github.com/OmniSharp/omnisharp-roslyn/pull/1922))
* Support for configurations remapping in solution files ([#1828](https://github.com/OmniSharp/omnisharp-roslyn/issues/1828), PR: [#1835](https://github.com/OmniSharp/omnisharp-roslyn/pull/1835))
* Only run dotnet --info once for the working directory (PR: [#1925](https://github.com/OmniSharp/omnisharp-roslyn/pull/1925))
* Update build tool versions for NET 5 RC1 (PR: [#1926](https://github.com/OmniSharp/omnisharp-roslyn/pull/1926))
* Update Roslyn to 3.8.0-3.20451.2 (PR: [#1927](https://github.com/OmniSharp/omnisharp-roslyn/pull/1927))

## [1.37.0] - 2020-08-18
* Update Roslyn version and tooling to match .NET 5 Preview8 (PR: [#1897](https://github.com/OmniSharp/omnisharp-roslyn/pull/1897))
* Updated lsp library to fix issue with signature help, etc (PR: [#1890](https://github.com/OmniSharp/omnisharp-roslyn/pull/1890))
* Include version matched target files with minimal MSBuild (PR: [#1895](https://github.com/OmniSharp/omnisharp-roslyn/pull/1895))
* Fix lack of trailing italics in quickinfo (PR: [#1894](https://github.com/OmniSharp/omnisharp-roslyn/pull/1894))
* Added System.Reflection.Emit.* to embedded mono script (PR: [#1892](https://github.com/OmniSharp/omnisharp-roslyn/pull/1892))
* Start moving omnisharp to directly using Roslyn's completion service (PR: [#1877](https://github.com/OmniSharp/omnisharp-roslyn/pull/1877))
* Add asynchronous test completed events (PR: [#1802](https://github.com/OmniSharp/omnisharp-roslyn/pull/1802))

## [1.36.1] - 2020-08-12
* Fix MSBuild version mismatch with new SDKs ([omnisharp-vscode#3951](https://github.com/OmniSharp/omnisharp-vscode/issues/3951), PR: [#1883](https://github.com/OmniSharp/omnisharp-roslyn/pull/1883))

## [1.36.0] - 2020-08-10
* Introduced a new `/quickinfo` endpoint to provide a richer set of information compared to `/typeinfo`. Consumers are encouraged to use it as their hover provider ([#1808](https://github.com/OmniSharp/omnisharp-roslyn/issues/1808), PR: [#1860](https://github.com/OmniSharp/omnisharp-roslyn/pull/1860))
* Updated LSP hover provider to use the new QuickInfo based services (PR: [#1870](https://github.com/OmniSharp/omnisharp-roslyn/pull/1870))
* Fixed return type in LSP completion handler ([#1864](https://github.com/OmniSharp/omnisharp-roslyn/issues/1864), PR: [#1869](https://github.com/OmniSharp/omnisharp-roslyn/pull/1869))
* Upgraded to the latest version of the csharp-language-server-protocol [#1815](https://github.com/OmniSharp/omnisharp-roslyn/pull/1815)
* Added support for Roslyn `EmbeddedLanguageCompletionProvider` which enables completions for string literals for `DateTime` and `Regex` ([#1871](https://github.com/OmniSharp/omnisharp-roslyn/pull/1871))
* Improve performance of the `textDocument/codeAction` request. (PR: [#1814](https://github.com/OmniSharp/omnisharp-roslyn/pull/1814))
* Updated Roslyn to Roslyn version and tools to match .NET 5 Preview8 (PR: [#1867](https://github.com/OmniSharp/omnisharp-roslyn/pull/1867))
* Provide a warning when the discovered MSBuild version is lower than the minimumMSBuildVersion supported by the configured SDK (PR: [#1875](https://github.com/OmniSharp/omnisharp-roslyn/pull/1875))
* Use the real MSBuild product version during discovery (PR: [#1876](https://github.com/OmniSharp/omnisharp-roslyn/pull/1876))
* Fixed debugging in .NET 5 preview SDKs ([omnisharp-vscode#3459](https://github.com/OmniSharp/omnisharp-vscode/issues/3459), PR: [#1862](https://github.com/OmniSharp/omnisharp-roslyn/pull/1862))

## [1.35.4] - 2020-07-22
* Update to Roslyn `3.8.0-1.20357.3` (PR: [#1849](https://github.com/OmniSharp/omnisharp-roslyn/pull/1849))
* Added LSP handler for the `workspace/symbol` request. (PR: [#1799](https://github.com/OmniSharp/omnisharp-roslyn/pull/1799))
* Use global MSBuild property when resetting target framework ([#1738](https://github.com/OmniSharp/omnisharp-roslyn/issues/1738), PR: [#1846](https://github.com/OmniSharp/omnisharp-roslyn/pull/1846))
* Do not use Visual Studio MSBuild if it doesn't have .NET SDK resolver ([#1842](https://github.com/OmniSharp/omnisharp-roslyn/issues/1842), [#1730](https://github.com/OmniSharp/omnisharp-roslyn/issues/1730), PR: [#1845](https://github.com/OmniSharp/omnisharp-roslyn/pull/1845))
* Only request dotnet info once for the solution or directory ([#1844](https://github.com/OmniSharp/omnisharp-roslyn/issues/1844), PR: [#1857](https://github.com/OmniSharp/omnisharp-roslyn/pull/1857))
* Allow client to specify symbol filter for FindSymbols Endpoint. (PR: [#1823](https://github.com/OmniSharp/omnisharp-roslyn/pull/1823))
* Exclude additive classifications from "/highlight" requests ([#1576](https://github.com/OmniSharp/omnisharp-roslyn/issues/1576), PR: [#1726](https://github.com/OmniSharp/omnisharp-roslyn/pull/1726))
* Upgraded to Mono 6.10.0.105, msbuild 16.6 and added missing targets (PR: [#1854](https://github.com/OmniSharp/omnisharp-roslyn/pull/1854))

## [1.35.3] - 2020-06-11
* Added LSP handler for `textDocument/codeAction` request. (PR: [#1795](https://github.com/OmniSharp/omnisharp-roslyn/pull/1795))
* Expose a custom LSP `omnisharp/client/findReferences` command via code lens (meant to be handled by LSP client). (PR: [#1807](https://github.com/OmniSharp/omnisharp-roslyn/pull/1807))
* Added `DirectoryDelete` option to `FileChangeType` allowing clients to report deleted directories that need to be removed (along all the files) from the workspace (PR: [#1821](https://github.com/OmniSharp/omnisharp-roslyn/pull/1821))
* Do not crash when plugin assembly cannot be loaded ([#1307](https://github.com/OmniSharp/omnisharp-roslyn/issues/1307), PR: [#1827](https://github.com/OmniSharp/omnisharp-roslyn/pull/1827))

## [1.35.2] - 2020-05-20
* Added support for `WarningsAsErrors` in csproj files (PR: [#1779](https://github.com/OmniSharp/omnisharp-roslyn/pull/1779))
* Added support for `WarningsNotAsErrors` in csproj files ([#1681](https://github.com/OmniSharp/omnisharp-roslyn/issues/1681), PR: [#1784](https://github.com/OmniSharp/omnisharp-roslyn/pull/1784))
* Improved MSBuild scoring system ([#1783](https://github.com/OmniSharp/omnisharp-roslyn/issues/1783), PR: [#1797](https://github.com/OmniSharp/omnisharp-roslyn/pull/1797))
* Updated OmniSharp.Extensions.LanguageServer to `0.14.2` to fix synchronisation (PR: [#1791](https://github.com/OmniSharp/omnisharp-roslyn/pull/1791))
* Add test discovery and NoBuild option to test requests (PR: [#1719](https://github.com/OmniSharp/omnisharp-roslyn/pull/1719))
* Update to Roslyn `3.7.0-2.20269.10` (PR: [#1804](https://github.com/OmniSharp/omnisharp-roslyn/pull/1804))

## [1.35.1] - 2020-05-04
* Fixed not supported exception when trying to decompile a BCL assembly on Mono. For now we do not try to resolve implementation assembly from a ref assembly (PR: [#1767](https://github.com/OmniSharp/omnisharp-roslyn/pull/1767))
* Added support for generic classes in test runner ([omnisharp-vscode#3722](https://github.com/OmniSharp/omnisharp-vscode/issues/3722), PR: [#1768](https://github.com/OmniSharp/omnisharp-roslyn/pull/1768))
* Improved autocompletion performance (PR: [#1761](https://github.com/OmniSharp/omnisharp-roslyn/pull/1761))
* Move to Roslyn's .editorconfig support ([#1657](https://github.com/OmniSharp/omnisharp-roslyn/issues/1657), PR: [#1771](https://github.com/OmniSharp/omnisharp-roslyn/pull/1771))
* Fully update CompilationOptions when project files change (PR: [#1774](https://github.com/OmniSharp/omnisharp-roslyn/pull/1774))
* Updated to Roslyn `3.6.0-4.20228.5` (PR: [#1778](https://github.com/OmniSharp/omnisharp-roslyn/pull/1778))

## [1.35.0] - 2020-04-10
* Support for `<RunAnalyzers />` and `<RunAnalyzersDuringLiveAnalysis />` (PR: [#1739](https://github.com/OmniSharp/omnisharp-roslyn/pull/1739))
* Add `typeparam` documentation comments to text description ([omnisharp-vscode#3516](https://github.com/OmniSharp/omnisharp-vscode/issues/3516), PR: [#1749](https://github.com/OmniSharp/omnisharp-roslyn/pull/1749))
* Tag `#region` blocks appropriately in the block structure service ([omnisharp-vscode#2621](https://github.com/OmniSharp/omnisharp-vscode/issues/2621), PR: [#1748](https://github.com/OmniSharp/omnisharp-roslyn/pull/1748))
* Added support for decompilation based on ILSpy (similar to VS). The feature is currently opt-into and needs to be enabled using OmniSharp configuration (PR: [#1751](https://github.com/OmniSharp/omnisharp-roslyn/pull/1751))
    ```JSON
        {
            "RoslynExtensionsOptions": {
                "enableDecompilationSupport": true
            }
        }
    ```

## [1.34.15] - 2020-03-25
* Support for .NET Core 3.1 in csx files (PR: [#1731](https://github.com/OmniSharp/omnisharp-roslyn/pull/1731))
* Update the minimal MSBuild to better support .NET 5 Previews ([omnisharp-vscode#3653](https://github.com/OmniSharp/omnisharp-vscode/issues/3653), PR: [#1746](https://github.com/OmniSharp/omnisharp-roslyn/pull/1746))
* Updated to Roslyn `3.6.0-3.20170.19` (PR: [#1745](https://github.com/OmniSharp/omnisharp-roslyn/pull/1745))
* Added semantic highlighting endpoint `/v2/highlight` (PR: [#1734](https://github.com/OmniSharp/omnisharp-roslyn/pull/1734))

## [1.34.14] - 2020-03-09
* Added support for `annotations` value of `Nullable` csproj property ([#1721](https://github.com/OmniSharp/omnisharp-roslyn/issues/1721), PR: [#1722](https://github.com/OmniSharp/omnisharp-roslyn/pull/1722))
* Added ability to specify custom RunSettings for tests (PR: [omnisharp-vscode#3573](https://github.com/OmniSharp/omnisharp-vscode/pull/3573), PR: [#1710](https://github.com/OmniSharp/omnisharp-roslyn/pull/1710))

## [1.34.13] - 2020-02-19
* Fixed a bug where organizing usings clashed with other formatting settings (PR: [#1715](https://github.com/OmniSharp/omnisharp-roslyn/pull/1713))

## [1.34.12] - 2020-02-18
* Fixed out of bounds exception in line mapping ([omnisharp-vscode#3485](https://github.com/OmniSharp/omnisharp-vscode/issues/3485), PR: [#1707](https://github.com/OmniSharp/omnisharp-roslyn/pull/1707))
* Added support for aliases in project references ([#1685](https://github.com/OmniSharp/omnisharp-roslyn/issues/1685), PR: [#1701](https://github.com/OmniSharp/omnisharp-roslyn/pull/1701))
* Raised the lowest discovered VS2019 version to 16.3 ([#1700](https://github.com/OmniSharp/omnisharp-roslyn/issues/1700), PR: [#1713](https://github.com/OmniSharp/omnisharp-roslyn/pull/1713))

## [1.34.11] - 2020-02-05
* Updated the bundled Mono to 6.8.0 and MSBuild to be copied from Mono 6.8.0 ([#1693](https://github.com/OmniSharp/omnisharp-roslyn/issues/1693), PR: [#1697](https://github.com/OmniSharp/omnisharp-roslyn/pull/1697))
* Included NugetSDKResolver in the minimal MSBuild, which introduces support for Nuget based project SDKs like Arcade ([#1678](https://github.com/OmniSharp/omnisharp-roslyn/issues/1678), PR: [#1696](https://github.com/OmniSharp/omnisharp-roslyn/pull/1696))

## [1.34.10] - 2020-01-27
* Update to Roslyn `3.5.0-beta3-20058-03` (PR: [#1680](https://github.com/OmniSharp/omnisharp-roslyn/pull/1680))
* Fixed a bug where completion items didn't decode symbols corectly (impacted, for example, object initializer completion quality) ([omnisharp-vscode#3465](https://github.com/OmniSharp/omnisharp-vscode/issues/3465), PR: [#1670](https://github.com/OmniSharp/omnisharp-roslyn/pull/1670))
* Updated to MsBuild 16.4.0 on Linux/MacOS (PR:[#1669](https://github.com/OmniSharp/omnisharp-roslyn/pull/1669))
* Added support for implement type options - it is now possible to define whether code-fix/refactoring generated properties should be auto- or throwing-properties and at which place in the class should newly generated members be inserted. They can be set via OmniSharp configuration, such as `omnisharp.json` file. (PR: [#1672](https://github.com/OmniSharp/omnisharp-roslyn/pull/1672))
    ```JSON
    {
        "ImplementTypeOptions": {
            "PropertyGenerationBehavior": "PreferAutoProperties", // or "PreferThrowingProperties" which is the default
            "InsertionBehavior": "AtTheEnd" // or "WithOtherMembersOfTheSameKind" which is default
        }
    }
    ```
* Added support for organizing usings on format. This can be set via OmniSharp configuration, such as `omnisharp.json` file. (PR: [#1686](https://github.com/OmniSharp/omnisharp-roslyn/pull/1686))
    ```JSON
    {
        "FormattingOptions": {
            "OrganizeImports": true
        }
    }
    ```

## [1.34.9] - 2019-12-10
* Updated to MsBuild 16.4.0 on Windows (PR:[#1662](https://github.com/OmniSharp/omnisharp-roslyn/pull/1662))
* Line pragma is now respected in find references ([#1649](https://github.com/OmniSharp/omnisharp-roslyn/issues/1649), PR:[#1660](https://github.com/OmniSharp/omnisharp-roslyn/pull/1660))
* Do not set mono paths when running in standalone mode ([omnisharp-vscode#3410](https://github.com/OmniSharp/omnisharp-vscode/issues/3410), [omnisharp-vscode#3340](https://github.com/OmniSharp/omnisharp-vscode/issues/3340), [#1650](https://github.com/OmniSharp/omnisharp-roslyn/issues/1650), PR:[#1656](https://github.com/OmniSharp/omnisharp-roslyn/pull/1656))
* Fixed a bug where OmniSharp would crash on startup if the path contained `=` sign ([omnisharp-vscode#3436](https://github.com/OmniSharp/omnisharp-vscode/issues/3436), PR:[#1661](https://github.com/OmniSharp/omnisharp-roslyn/pull/1661))
* Update to Roslyn `3.5.0-beta2-19606-01` (PR:[#1663](https://github.com/OmniSharp/omnisharp-roslyn/pull/1663))

## [1.34.8] - 2019-11-21
* Update to Roslyn `3.5.0-beta1-19571-01` (PR:[#1653](https://github.com/OmniSharp/omnisharp-roslyn/pull/1653))
* Support plugins configuration in omnisharp.json (PR:[#1615](https://github.com/OmniSharp/omnisharp-roslyn/pull/1615))

## [1.34.7] - 2019-11-06
* Updated the embedded Mono to 6.4.0 (PR:[#1640](https://github.com/OmniSharp/omnisharp-roslyn/pull/1640))
* Update to Roslyn `3.4.0-beta3-19551-02` to align with the upcoming .NET Core 3.1 Preview 3 (PR:[#1644](https://github.com/OmniSharp/omnisharp-roslyn/pull/1644))

## [1.34.6] - 2019-10-25
* Update to Roslyn `3.4.0-beta3-19516-01` (PR:[#1634](https://github.com/OmniSharp/omnisharp-roslyn/pull/1634))
* Fixed a bug that caused CS0019 diagnostic to be erroneously reported when comparing to `default` ([#1619](https://github.com/OmniSharp/omnisharp-roslyn/issues/1619), PR:[#1634](https://github.com/OmniSharp/omnisharp-roslyn/pull/1634))
* Raised minimum Mono version to 6.4.0 to provide better .NET Core 3.0 support ([#1629](https://github.com/OmniSharp/omnisharp-roslyn/pull/1629))
* Fixed a concurrency bug in scripting/Cake support ([#1627](https://github.com/OmniSharp/omnisharp-roslyn/pull/1627))
* Correctly respect request cancellation token in metadata service ([#1631](https://github.com/OmniSharp/omnisharp-roslyn/pull/1631))

## [1.34.5] - 2019-10-08
* Fixed 1.34.4 regression that caused "go to metadata" to not work ([#1624](https://github.com/OmniSharp/omnisharp-roslyn/issues/1624), PR: [#1625](https://github.com/OmniSharp/omnisharp-roslyn/pull/1625))
* Updated the Dotnet.Script.DependencyModel and Dotnet.Script.DependencyModel.NuGet packages to version 0.50.0 adding support for .NET Core 3.0 based scripts (PR: [#1609](https://github.com/OmniSharp/omnisharp-roslyn/pull/1609))

## [1.34.4] - 2019-09-30
* Upgraded to MSBuild 16.3 and Mono MSBuild 16.3 (from Mono 6.4.0) to support .NET Core 3.0 RTM (PR: [#1616](https://github.com/OmniSharp/omnisharp-roslyn/pull/1616), [#1612](https://github.com/OmniSharp/omnisharp-roslyn/pull/1612), [#1606](https://github.com/OmniSharp/omnisharp-roslyn/pull/1606))
* Fixed behavior when there are multiple handlers are defined for a language for a given request (PR: [#1582](https://github.com/OmniSharp/omnisharp-roslyn/pull/1582))

## [1.34.3] - 2019-09-11
* Added support for `CheckForOverflowUnderflow ` in csproj files (PR: [#1587](https://github.com/OmniSharp/omnisharp-roslyn/pull/1587))
* Updated LSP libraries to 0.13 which fixes problems with clients not supporting dynamic registrations. ([#1505](https://github.com/OmniSharp/omnisharp-roslyn/issues/1505), [#1525](https://github.com/OmniSharp/omnisharp-roslyn/issues/1525), PR: [#1562](https://github.com/OmniSharp/omnisharp-roslyn/pull/1562))
* Update to Roslyn `3.4.0-beta1-19460-02` to align with the upcoming .NET Core 3.1 preview 1 (PR:[#1597](https://github.com/OmniSharp/omnisharp-roslyn/pull/1597))

## [1.34.2] - 2019-08-16
* Update to Roslyn `3.3.0-beta2-19401-05` which fixes a 1.34.1 regression resulting in StackOverflowException on code analysis of partial classes (PR: [#1579](https://github.com/OmniSharp/omnisharp-roslyn/pull/1579))
* Added support for reading C# 8.0 `Nullable` setting from csproj files (and dropped support for `NullableContextOptions` - based on the LDM decision to [rename the MSBuild property](https://github.com/dotnet/roslyn/issues/35432) ([#1573](https://github.com/OmniSharp/omnisharp-roslyn/pull/1573))

## [1.34.1] - 2019-07-31
* Added support for "sync namespace" refactoring ([#1475](https://github.com/OmniSharp/omnisharp-roslyn/issues/1475), PR: [#1563](https://github.com/OmniSharp/omnisharp-roslyn/pull/1563))
* Fixed a regression introduced in 1.32.20 which caused `AllowUnsafeCode` in csproj to also enable `TreatWarningsAsErrors` behavior ([#1565](https://github.com/OmniSharp/omnisharp-roslyn/issues/1565), PR: [#1567](https://github.com/OmniSharp/omnisharp-roslyn/pull/1567))
* Update to Roslyn `3.3.0-beta2-19376-02` (PR: [#1563](https://github.com/OmniSharp/omnisharp-roslyn/pull/1563))
* Fixed a timeout issue in large analyzer bundles (i.e. FxCop analyzers) ([#1552](https://github.com/OmniSharp/omnisharp-roslyn/issues/1552), PR: [#1566](https://github.com/OmniSharp/omnisharp-roslyn/pull/1566))

## [1.34.0] - 2019-07-15
* Added support for Roslyn code actions that normally need UI - they used to be explicitly sipped by OmniSharp, now it surfaces them with predefined defaults instead. ([#1220](https://github.com/OmniSharp/omnisharp-roslyn/issues/1220), PR: [#1406](https://github.com/OmniSharp/omnisharp-roslyn/pull/1406)) These are:
  * extract interface
  * generate constructor
  * generate overrides
  * generate *Equals* and *GetHashCode*
* Improved analyzers performance by introducing background analysis support ([#1507](https://github.com/OmniSharp/omnisharp-roslyn/pull/1507))
* According to [official Microsoft .NET Core support policy](https://dotnet.microsoft.com/platform/support/policy/dotnet-core), .NET Core 1.0 and 1.1 (`project.json`-based .NET Core flavors) have reached end of life and went out of support on 27 June 2019. OmniSharp features to support that, which have been obsolete and disabled by default since version 1.32.2 (2018-08-07), are now completely removed.
* Fixed a bug where some internal services didn't respect the disabling of a project system ([#1543](https://github.com/OmniSharp/omnisharp-roslyn/pull/1543))
* Improved the MSBuild selection logic. The standalone instance inside OmniSharp is now preferred over VS2017, with VS2019 given the highest priority. This ensures that .NET Core 3.0 works correctly. It is also possible manually provide an MSBuild path using OmniSharp configuration, which is then always selected. ([#1541](https://github.com/OmniSharp/omnisharp-roslyn/issues/1541), PR: [#1545](https://github.com/OmniSharp/omnisharp-roslyn/pull/1545))
    ```JSON
        {
            "MSBuild": {
                "MSBuildOverride": {
                    "MSBuildPath": "C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Enterprise\\MSBuild\\15.0\\Bin",
                    "Name": "vs2017 msbuild"
                }
            }
        }
    ```
* Added support for *AdditionalFiles* in csproj files ([#1510](https://github.com/OmniSharp/omnisharp-roslyn/issues/1510), PR: [#1547](https://github.com/OmniSharp/omnisharp-roslyn/pull/1547))
* Fixed a bug in *.editorconfig* where formatting settings were not correctly passed into external code fixes ([#1558](https://github.com/OmniSharp/omnisharp-roslyn/issues/1558), PR: [#1559](https://github.com/OmniSharp/omnisharp-roslyn/pull/1559))

## [1.33.0] - 2019-07-01
* Added support for `.editorconfig` files to control formatting settings, analyzers, coding styles and naming conventions. The feature is currently opt-into and needs to be enabled using OmniSharp configuration ([#31](https://github.com/OmniSharp/omnisharp-roslyn/issues/31), PR: [#1526](https://github.com/OmniSharp/omnisharp-roslyn/pull/1526))
    ```JSON
        {
            "FormattingOptions": {
                "EnableEditorConfigSupport": true
            }
        }
    ```
* Analyzers improvements (PR: [#1440](https://github.com/OmniSharp/omnisharp-roslyn/pull/1440))
	* Dynamically loaded / modifiable rulesets instead without full restart on omnisharp after every change
	* Reanalyze updated projects
	* Built-int Roslyn diagnostics can be controlled by rulesets even when analyzers are not enabled
	* Faster analysis since project isn't updated every time
	* When project is restored it is re-analyzed with correct dependencies
* Added support for various renaming options - renaming any symbol can now propagate to comments or strings, and renaming a method symbol can also rename its overloads. They can be set via OmniSharp configuration, such as `omnisharp.json` file (they are disabled by default). (PR: [#1495](https://github.com/OmniSharp/omnisharp-roslyn/pull/1495))
    ```JSON
    {
        "RenameOptions": {
            "RenameInComments": true,
            "RenameOverloads": true,
            "RenameInStrings": true
        }
    }
    ```
* Fixed a regression on declaration name completion (PR: [#1520](https://github.com/OmniSharp/omnisharp-roslyn/pull/1520))
* Update to Roslyn `3.2.0-beta4-19326-12` (PR: [#1534](https://github.com/OmniSharp/omnisharp-roslyn/pull/1534))
* Added snippets support in LSP mode (PR: [#1422](https://github.com/OmniSharp/omnisharp-roslyn/pull/1422))
* Fixed renaming in LSP mode (PR: [#1423](https://github.com/OmniSharp/omnisharp-roslyn/pull/1423))

## [1.32.20] - 2019-06-03
* Added support for `TreatWarningsAsErrors` in csproj files (PR: [#1459](https://github.com/OmniSharp/omnisharp-roslyn/pull/1459))
* Updated to Roslyn `3.2.0-beta3-19281-01` to match VS dev16.2p2 (PR: [#1511](https://github.com/OmniSharp/omnisharp-roslyn/pull/1511))
* Updated to `OmniSharp.Extensions.LanguageServer` 0.12.1 ([#1403](https://github.com/OmniSharp/omnisharp-roslyn/issues/1403), PR: [#1503](https://github.com/OmniSharp/omnisharp-roslyn/pull/1503))
* Fixed assembly redirects when shadow copying analyzers ([#1496](https://github.com/OmniSharp/omnisharp-roslyn/issues/1496), PR: [#1497](https://github.com/OmniSharp/omnisharp-roslyn/pull/1497))
* Fixed a logical bug in symbol completion (PR: [#1491](https://github.com/OmniSharp/omnisharp-roslyn/pull/1491))
* Added support for `preview` and `latestmajor` C# language versions ([#1487](https://github.com/OmniSharp/omnisharp-roslyn/issues/1487), PR: [#1488](https://github.com/OmniSharp/omnisharp-roslyn/pull/1488))

## [1.32.19] - 2019-05-01
* Updated to Roslyn `3.1.0-beta4-19251-02` (PR: [#1479](https://github.com/OmniSharp/omnisharp-roslyn/pull/1479))
* Shadow copy Roslyn analyzers in order to not lock them ([#1465](https://github.com/OmniSharp/omnisharp-roslyn/issues/1465), PR: [#1474](https://github.com/OmniSharp/omnisharp-roslyn/pull/1474))
* Fixed logging output for OmniSharp HTTP server ([#1466](https://github.com/OmniSharp/omnisharp-roslyn/issues/1446), PR: [#1456](https://github.com/OmniSharp/omnisharp-roslyn/pull/1456))
* Fixed OmniSharp hanging on wildcard Nuget package references ([omnisharp-vscode#3009](https://github.com/OmniSharp/omnisharp-vscode/issues/3009), PR: [#1473](https://github.com/OmniSharp/omnisharp-roslyn/pull/1473))
* OmniSharp now uses correct 4.7.2 framework sku to prompt for installation of .NET 4.7.2 if missing ([#1468](https://github.com/OmniSharp/omnisharp-roslyn/issues/1468), PR: [#1469](https://github.com/OmniSharp/omnisharp-roslyn/pull/1469))

## [1.32.18] - 2019-04-12
* Renamed `ProjectGuid` to `ProjectId` and no longer hash target framework names on `ProjectConfigurationMessage` (PR: [#1454](https://github.com/OmniSharp/omnisharp-roslyn/pull/1454))

## [1.32.17] - 2019-04-12
* Fixed a bug in embedded MSBuild 16 path detection (PR: [#1457](https://github.com/OmniSharp/omnisharp-roslyn/pull/1457))

## [1.32.16] - 2019-04-10
* .NET Core 3.0 support (PR: [#1450](https://github.com/OmniSharp/omnisharp-roslyn/pull/1450))
* Upgraded to Roslyn `3.1.0-beta2-19205-01` (PR: [#1448](https://github.com/OmniSharp/omnisharp-roslyn/pull/1448))
* Enabled outline support from LSP (PR: [#1411](https://github.com/OmniSharp/omnisharp-roslyn/pull/1411))

## [1.32.15] - 2019-04-09
* Startup performance improvements (PR: [#1427](https://github.com/OmniSharp/omnisharp-roslyn/pull/1427))

## [1.32.14] - 2019-04-08
* OmniSharp now targets **net472**, instead of **net461** (PR: [#1444](https://github.com/OmniSharp/omnisharp-roslyn/pull/1444))
* Upgraded OmniSharp to use Mono 5.18.1 and MSBuild `16.0.461` (PR: [#1444](https://github.com/OmniSharp/omnisharp-roslyn/pull/1444))

## [1.32.13] - 2019-04-02
* Added experimental support for Roslyn analyzers and code fixes (PR: [#1076](https://github.com/OmniSharp/omnisharp-roslyn/pull/1076))
* Included constant values in `/typelookup` responses ([omnisharp-vscode#2857](https://github.com/OmniSharp/omnisharp-vscode/issues/2857), PR: [#1420](https://github.com/OmniSharp/omnisharp-roslyn/pull/1420))
* Fixed transient documents not disappearing on project update  (PR: [#1159](https://github.com/OmniSharp/omnisharp-roslyn/pull/1159))
* When fixing usings, return namespaces associated with ambiguous result (PR: [#1169](https://github.com/OmniSharp/omnisharp-roslyn/pull/1169))
* Fixed refusing HTTP connections ([#1274](https://github.com/OmniSharp/omnisharp-roslyn/issues/1274), PR: [#1361](https://github.com/OmniSharp/omnisharp-roslyn/pull/1361))
* Fixed find references for indexer properties (PR: [#1399](https://github.com/OmniSharp/omnisharp-roslyn/pull/1399))
* Added Roslyn 'tags' to diagnostic response (PR: [#1410](https://github.com/OmniSharp/omnisharp-roslyn/pull/1410))
* Added support for `extern alias` ([omnisharp-vscode#2342](https://github.com/OmniSharp/omnisharp-vscode/issues/2342), PR: [#1409](https://github.com/OmniSharp/omnisharp-roslyn/pull/1409))

## [1.32.11] - 2019-02-27
* Updated to Roslyn `3.0.0-beta4-19126-05` to match VS 16.0p4 ([#1413](https://github.com/OmniSharp/omnisharp-roslyn/issues/1413), PR: [#1414](https://github.com/OmniSharp/omnisharp-roslyn/pull/1414))
* Added support for reading C# 8.0 `NullableContextOptions` from csproj files ([#1396](https://github.com/OmniSharp/omnisharp-roslyn/issues/1396), PR: [#1404](https://github.com/OmniSharp/omnisharp-roslyn/pull/1404))

## [1.32.10] - 2019-01-25
* Updated to Roslyn 3.0 to match [VS 2019](https://docs.microsoft.com/en-us/visualstudio/releases/2019/release-notes-preview#VS2019_Preview2) (PR: [#1391](https://github.com/OmniSharp/omnisharp-roslyn/pull/1391))
* Fixed shutdown event handling for LSP _(Contributed by [@LoneBoco](https://github.com/LoneBoco))_ ([#1113](https://github.com/OmniSharp/omnisharp-roslyn/issues/1113), PR: [#1345](https://github.com/OmniSharp/omnisharp-roslyn/pull/1345))

## [1.32.9] - 2019-1-22
* Updated to Roslyn `2.11.0-beta1-final` and initial support for C# 8 (PR: [#1365](https://github.com/OmniSharp/omnisharp-roslyn/pull/1365))
* Incorporate *IndentSwitchCaseSectionWhenBlock* into OmniSharp's formatting options. This fixes the default formatting behavior, as the setting is set to *true* by default, and still allows users to disable it if needed. ([#1351](https://github.com/OmniSharp/omnisharp-roslyn/issues/1351), PR: [#1353](https://github.com/OmniSharp/omnisharp-roslyn/pull/1353))
* Removed unused `-stdio` flag from the `StdioCommandLineApplication` (PR: [#1362](https://github.com/OmniSharp/omnisharp-roslyn/pull/1362))
* Fixed finding references to operator overloads _(Contributed by [@SirIntruder](https://github.com/SirIntruder))_ (PR: [#1371](https://github.com/OmniSharp/omnisharp-roslyn/pull/1371))
* Fixed a 1.29.0 regression that caused LSP not to work with `StdioCommandLineApplication` ([#1269](https://github.com/OmniSharp/omnisharp-roslyn/issues/1269), PR: [#1346](https://github.com/OmniSharp/omnisharp-roslyn/pull/1346))
* Improved handling of files moving on disk (PR: [#1368](https://github.com/OmniSharp/omnisharp-roslyn/pull/1368))
* Improved detection of MSBuild when multiple instances are available _(Contributed by [@johnnyasantoss ](https://github.com/johnnyasantoss))_ (PR: [#1349](https://github.com/OmniSharp/omnisharp-roslyn/pull/1349))

## [1.32.8] - 2018-11-14
* Fixed MSBuild discovery path (1.32.7 regression) (PR: [#1337](https://github.com/OmniSharp/omnisharp-roslyn/pull/1337))

## [1.32.7] - 2018-11-12
* It's now possible to override the default location of OmniSharp's global folder (%USERPROFILE%\.omnisharp or ~/.omnisharp.) with an OMNISHARPHOME environment variable (PR: [#1317](https://github.com/OmniSharp/omnisharp-roslyn/pull/1317))
* OmniSharp no longer searches for `config.json` in its source directory to load configuration (PR: [#1319](https://github.com/OmniSharp/omnisharp-roslyn/pull/1319))
* Fixed a regression introduced in 1.32.4, that prevented find symbol endpoint from working for CSX projects (PR: [#1321](https://github.com/OmniSharp/omnisharp-roslyn/pull/1321))
* Improved MSBuild discovery for future scenarios (PR: [#1328](https://github.com/OmniSharp/omnisharp-roslyn/pull/1328))
* Enabled setting customer OmniSharp home directory (PR: [#1317](https://github.com/OmniSharp/omnisharp-roslyn/pull/1317))
* Made detection of .sln files more accurate  _(Contributed by [@itn3000](https://github.com/itn3000))_ (PR: [#1320](https://github.com/OmniSharp/omnisharp-roslyn/pull/1320))
* Improved reliability of document management subsystem _(Contributed by [@NTaylorMullen](https://github.com/NTaylorMullen))_ (PR: [#1330](https://github.com/OmniSharp/omnisharp-roslyn/pull/1330))
* Use Roslyn's new `FindSourceDeclarationsWithPatternAsync` API in symbol finder _(Contributed by [@SirIntruder](https://github.com/SirIntruder))_ (PR: [#1304](https://github.com/OmniSharp/omnisharp-roslyn/pull/1304))
* Fix `FindImplementationService` not finding all implementations of the partial class _(Contributed by [@SirIntruder](https://github.com/SirIntruder))_ (PR: [#1318](https://github.com/OmniSharp/omnisharp-roslyn/pull/1318))

## [1.32.6] - 2018-10-02
* Fixed a bug where virtual C# documents would not get promoted to be a part of a project. (PR: [#1306](https://github.com/OmniSharp/omnisharp-roslyn/pull/1306)).
* Added MinFilterLength to configure the number of characters a user must type in for FindSymbolRequest command to return any results (default is 0 to preserve existing behavior). Additionally added MaxItemsToReturn for configuring maximum number of items returned by the FindSymbolsRequestAPI.(PR: [#1284](https://github.com/OmniSharp/omnisharp-roslyn/pull/1284)).
* Fixed issue where `/codestructure` endpoint did not return enum members. (PR: [#1285](https://github.com/OmniSharp/omnisharp-roslyn/pull/1285))
* Fixed issue where `/findimplemenations` endpoint did not return overridden members in derived types (PR: [#1302](https://github.com/OmniSharp/omnisharp-roslyn/pull/1302))

## [1.32.3] - 2018-08-28
* Added support for files without a project. (PR: [#1252](https://github.com/OmniSharp/omnisharp-roslyn/pull/1252))
* Fixed a bug where `*.rsp`-based scripting references where not exposed in the Workspace information endpoint (PR: [#1272](https://github.com/OmniSharp/omnisharp-roslyn/pull/1272))

## [1.32.2] - 2018-08-07
* OmniSharp now targets **net461**, instead of **net46** (PR: [#1237](https://github.com/OmniSharp/omnisharp-roslyn/pull/1237))
* Added new `/codestructure` endpoint which serves a replacement for the `/currentfilemembersastree` endpoint. The new endpoint has a cleaner design, properly supports all C# types and members, and supports more information, such as accessibility, static vs. instance, etc. (PRs: [#1211](https://github.com/OmniSharp/omnisharp-roslyn/pull/1211) [#1217](https://github.com/OmniSharp/omnisharp-roslyn/pull/1217))
* Fixed a bug where language services for newly created CSX files were not provided if no CSX files existed at the moment OmniSharp was started ([#1199](https://github.com/OmniSharp/omnisharp-roslyn/issues/1199), PR: [#1210](https://github.com/OmniSharp/omnisharp-roslyn/pull/1210))
* The legacy project.json support is now disabled by default, allowing OmniSharp to start up a bit faster for common scenarios. If you wish to enable project.json support, add the following setting to your `omnisharp.json` file. (PR: [#1194](https://github.com/OmniSharp/omnisharp-roslyn/pull/1194))

    ```JSON
    {
        "dotnet": {
            "enabled": false
        }
    }
    ```
* Added support for code actions in `.cake` files. ([#1205](https://github.com/OmniSharp/omnisharp-roslyn/issues/1205), PR: [#1212](https://github.com/OmniSharp/omnisharp-roslyn/pull/1212))
* Added a new `/blockstructure` endpoint that returns the spans of the C# code blocks (usings, namespaces, methods, etc.) in a file. (PRs: [#1209](https://github.com/OmniSharp/omnisharp-roslyn/pull/1209) [#1231](https://github.com/OmniSharp/omnisharp-roslyn/pull/1231))
* Fixed bug where find usages returned usages from loaded `.cake` files even though `OnlyThisFile` was set to `true` in the request. ([#1204](https://github.com/OmniSharp/omnisharp-roslyn/issues/1204), PR: [#1213](https://github.com/OmniSharp/omnisharp-roslyn/pull/1213))
* Performance improvements for line mappings when working with `.cake` files. (PR: [#1226](https://github.com/OmniSharp/omnisharp-roslyn/pull/1226))
* Fixed a bug where a new debug session could not be started after a previous one failed due to build error. (PR: [#1239](https://github.com/OmniSharp/omnisharp-roslyn/pull/1239))
* Upgraded dependencies (PR: [#1237](https://github.com/OmniSharp/omnisharp-roslyn/pull/1237))
  * Upgraded to .NET Core SDK 2.1.505
  * Upgraded to Microsoft.AspNetCore.* version 2.1.1
  * Upgraded to Microsoft.Extensions.* version 2.1.1
  * Upgraded to MSBuild 15.7
  * Upgraded to Roslyn 2.8.2

## [1.31.1] - 2018-05-28
* Fixed bug where diagnostics from loaded `.cake` files was shown in the current file. (PR: [#1201](https://github.com/OmniSharp/omnisharp-roslyn/pull/1201))

## [1.31.0] - 2018-05-29
* Update to Roslyn 2.8.0 packages, adding support for C# 7.3. (PR: [#1182](https://github.com/OmniSharp/omnisharp-roslyn/pull/1182))
* MSBuild project system no longer stops when a project fails to load. (PR: [#1181](https://github.com/OmniSharp/omnisharp-roslyn/pull/1181))
* Fixed null-reference exception that could be thrown during MSBuild discovery. ([#1188](https://github.com/OmniSharp/omnisharp-roslyn/issues/1188), PR: [#1189](https://github.com/OmniSharp/omnisharp-roslyn/issues/1188))
* Fixed an issue where referenced projects outside of OmniSharp's target path/solution would not be evaluated properly if they were multi-targeted (e.g. contained `<TargetFrameworks>`), which could result in downstream failures. ([omnisharp-vscode#2295](https://github.com/OmniSharp/omnisharp-vscode/issues/2295), PR: [#1195](https://github.com/OmniSharp/omnisharp-roslyn/pull/1195))
* Removed logic that set `MSBuildSDKsPath` environment variable before loading a project. This environment variable overrides normal MSBuild SDK resolution, which breaks resolution for custom MSBuild SDKs (for more information on MSBuild SDKs, see the [documentation](https://docs.microsoft.com/en-us/visualstudio/msbuild/how-to-use-project-sdk#how-project-sdks-are-resolved)). ([#1190](https://github.com/OmniSharp/omnisharp-roslyn/issues/1190), PR: [#1192](https://github.com/OmniSharp/omnisharp-roslyn/pull/1192))
    * **Breaking Change**: Removing this logic means that OmniSharp will no longer load .NET Core projects that target a .NET Core SDK with a version <= 1.0.3 by default. If you need to restore this behavior, you can set the following option in an `omnisharp.json` configuration file:

        ```JSON
        {
            "MSBuild": {
                "UseLegacySdkResolver": true
            }
        }
        ```
        See [Configuration Options](https://github.com/OmniSharp/omnisharp-roslyn/wiki/Configuration-Options) for more details on `omnisharp.json`.
* Support `/rename` endpoint in `.cake` files.
* Support custom `.rsp` files in scripting. It is now possible to use `omnisharp.json` to define a path to an `.rsp` file, containing predefined namespaces and assembly references, and OmniSharp will respect those as part of its language services for CSX files. For example, given the following `.rsp` file:

    ```
    /r:bin/FakeLib.dll
    /r:bin/FSharp.Core.dll
    /r:bin/FSharpx.Extras.dll
    /u:Fake
    /u:FSharpx
    /u:System.Linq
    /u:System.IO
    ```
    and the following `omnisharp.json`:

    ```
    {
        "Script": {
            "RspFilePath": "path/to/my.rsp"
        }
    }
    ```
    OmniSharp will automatically include the predefined DLLs and namespaces in the language services for all the scripts in the given folder (in case of a local `omnisharp.json`) or on the machine (in case of a global `omnisharp.json`). Note that the reference to `mscorlib`/`System.Runtime` is always there anyway and doesn't need to be specified again in the `.rsp` file. ([#1024](https://github.com/OmniSharp/omnisharp-roslyn/issues/1024), PR: [#1112](https://github.com/OmniSharp/omnisharp-roslyn/issues/1112))
    * Note that the reference to `mscorlib`/`System.Runtime` is always there anyway and doesn't need to be specified again in the `.rsp` file
    * only imports and references are supported as part of the `.rsp` file (scripting doesn't support other compiler settings passed using the `.rsp` file). In the future, depending on whether the [feature is available in Roslyn](https://github.com/dotnet/roslyn/issues/23421), OmniSharp may also support defining a scripting globals type via `.rsp` file.
* `.cake` files are now parsed using the C# version `Latest` rather than `Default`, to match the runtime behavior of Cake. (PR: [#1201](https://github.com/OmniSharp/omnisharp-roslyn/pull/1201))
* Updated `DotNetTest` result to include messages from stdout and stderr. (PR: [#1203](https://github.com/OmniSharp/omnisharp-roslyn/pull/1203))

## [1.30.1] - 2018-05-11
* Fixed a 1.30.0 regression that prevented the script project system from working on Unix-based systems (PR: [#1185](https://github.com/OmniSharp/omnisharp-roslyn/pull/1185))

## [1.30.0] - 2018-4-30
* Updated to Roslyn 2.7.0 packages (PR: [#1132](https://github.com/OmniSharp/omnisharp-roslyn/pull/1132))
* Ensure that the lower assembly versions are always superseded in C# scripts (PR: [#1103](https://github.com/OmniSharp/omnisharp-roslyn/pull/1103))
* Updated OmniSharp.Script to DotNet.Script.DependencyModel 0.6.0 (PR: [#1150](https://github.com/OmniSharp/omnisharp-roslyn/pull/1150))
* It is now possible to define the default target framework for C# scripts in the OmniSharp configuration (PR: [#1154](https://github.com/OmniSharp/omnisharp-roslyn/pull/1154))
* Upgraded embedded Mono and MSBuild to 5.10.1.20 (PRs: #[1137](https://github.com/OmniSharp/omnisharp-roslyn/pull/1137), #[1145](https://github.com/OmniSharp/omnisharp-roslyn/pull/1145))
* Fixed issue where generate type refactoring could not generate new files ([omnisharp-vscode#2112](https://github.com/OmniSharp/omnisharp-vscode/issues/2112), PR: [#1143](https://github.com/OmniSharp/omnisharp-roslyn/pull/1143))
* Added detailed project information output at debug log level (PR: [#1151](https://github.com/OmniSharp/omnisharp-roslyn/pull/1151))
* Set MSBuild property to allow the XAML markup compiler task to run (PR: [#1157](https://github.com/OmniSharp/omnisharp-roslyn/pull/1157))
* Added support for excluding search paths via globbing patterns ([#896](https://github.com/OmniSharp/omnisharp-roslyn/issues/896), PR: [#1161](https://github.com/OmniSharp/omnisharp-roslyn/pull/1161))
* Improved versioning reporting for VS preview consoles (PR: [#1166](https://github.com/OmniSharp/omnisharp-roslyn/pull/1166))

## [1.29.1] - 2018-2-12
* Fixed duplicate diagnostics in C# ([omnisharp-vscode#1830](https://github.com/OmniSharp/omnisharp-vscode/issues/1830), PR: [#1107](https://github.com/OmniSharp/omnisharp-roslyn/pull/1107))

## [1.29.0] - 2018-1-29
* Updated to Roslyn 2.6.1 packages - C# 7.2 support (PR: [#1055](https://github.com/OmniSharp/omnisharp-roslyn/pull/1055))
* Shipped Language Server Protocol support in box.  (PR: [#969](https://github.com/OmniSharp/omnisharp-roslyn/pull/969))
  - Additional information and features tracked at [#968](https://github.com/OmniSharp/omnisharp-roslyn/issues/968)
* Fixed locating Visual Studio with more than one installation (PR: [#1063](https://github.com/OmniSharp/omnisharp-roslyn/pull/1063))
* Do not crash when encoutering Legacy ASP.NET Website projects ([#1036](https://github.com/OmniSharp/omnisharp-roslyn/issues/1036), PRs: [#1066](https://github.com/OmniSharp/omnisharp-roslyn/pull/1066), [#1084](https://github.com/OmniSharp/omnisharp-roslyn/pull/1084))
* Improvements to the the structured documentation returned by the /typelookup endpoint ([#1046](https://github.com/OmniSharp/omnisharp-roslyn/issues/1046), [omnisharp-vscode#1057](https://github.com/OmniSharp/omnisharp-vscode/issues/1057),  PRs: [#1062](https://github.com/OmniSharp/omnisharp-roslyn/pull/1062) [#1064](https://github.com/OmniSharp/omnisharp-roslyn/pull/1064))
* Allowed specifying DLLs file paths for plugin loading (PR: [#1069](https://github.com/OmniSharp/omnisharp-roslyn/pull/1069))
* Improved http server performance (PR: [#1073](https://github.com/OmniSharp/omnisharp-roslyn/pull/1073))
* Added attribute span to file ([omnisharp-vscode#429](https://github.com/OmniSharp/omnisharp-vscode/issues/429), PR: [#1075](https://github.com/OmniSharp/omnisharp-roslyn/pull/1075))
* Order Code Actions according by `ExtensionOrderAttribute` ([omnisharp-roslyn#748](https://github.com/OmniSharp/omnisharp-roslyn/issues/758), PR: [#1078](https://github.com/OmniSharp/omnisharp-roslyn/pull/1078))
* Disabled Go To Definition on property get/set keywords  ([omnisharp-vscode#1949](https://github.com/OmniSharp/omnisharp-vscode/issues/1949), PR: [#1086](https://github.com/OmniSharp/omnisharp-roslyn/pull/1086/files))
* Disabled exceptions on assembly load failure (PR: [#1072](https://github.com/OmniSharp/omnisharp-roslyn/pull/1072))
* Added structured documentation to signature help ([omnisharp-vscode#1940](https://github.com/OmniSharp/omnisharp-vscode/issues/1940), PR: [#1085](https://github.com/OmniSharp/omnisharp-roslyn/pull/1085))
* Added /runalltests and /debugalltests endpoints to run or debug all the tests in a class ([omnisharp-vscode#1969](https://github.com/OmniSharp/omnisharp-vscode/pull/1961), PR: [#1961](https://github.com/OmniSharp/omnisharp-vscode/pull/1961))

## [1.28.0] - 2017-12-14

* Fixed issue with loading XML documentation for `#r` assembly references in CSX scripts ([#1026](https://github.com/OmniSharp/omnisharp-roslyn/issues/1026), PR: [#1027](https://github.com/OmniSharp/omnisharp-roslyn/pull/1027))
* Updated the `/v2/runcodeaction` end point to return document "renames" and "opens" that a code action might perform. (PR: [#1023](https://github.com/OmniSharp/omnisharp-roslyn/pull/1023))
* Corrected issue where MSBuild discovery would pick instances of Visual Studio 2017 that did not have Roslyn installed. ([#1031](https://github.com/OmniSharp/omnisharp-roslyn/issues/1031), PR: [#1032](https://github.com/OmniSharp/omnisharp-roslyn/pull/1032))
* Updated `/codecheck` endpoint to return diagnostic IDs. (PR: [#1034](https://github.com/OmniSharp/omnisharp-roslyn/pull/1034))
* Updated OmniSharp.Script to DotNet.Script.DependencyModel 0.3.0 (PR: [#1035](https://github.com/OmniSharp/omnisharp-roslyn/pull/1035))
* Fixed scripting suppot to not load the same assembly name multiple times ([dotnet-script#194](https://github.com/filipw/dotnet-script/issues/194), PR: [#1037](https://github.com/OmniSharp/omnisharp-roslyn/pull/1037))
* STDIO requests and responses are now pretty-printed during logging. (PR: [#1040](https://github.com/OmniSharp/omnisharp-roslyn/pull/1040))
* Several fixes to the `/signaturehelp` endpoint to return correct signatures in more locations. ([omnisharp-vscode#1440](https://github.com/OmniSharp/omnisharp-vscode/issues/1440), [omnisharp-vscode#1664](https://github.com/OmniSharp/omnisharp-vscode/issues/1664) [omnisharp-vscode#1715](https://github.com/OmniSharp/omnisharp-vscode/issues/1715), PRs: [#1030](https://github.com/OmniSharp/omnisharp-roslyn/pull/1030), [#1052](https://github.com/OmniSharp/omnisharp-roslyn/pull/1052))
* Updated `/typelookup` endpoint to include structured object representing the various sections of an XML doc comment. ([omnisharp-vscode#1057](https://github.com/OmniSharp/omnisharp-vscode/issues/1057), PR: [#1038](https://github.com/OmniSharp/omnisharp-roslyn/pull/1038))
* Ensure the correct range is used when formatting a span that includes preceding whitespace. ([omnisharp-vscode#214](https://github.com/OmniSharp/omnisharp-vscode/issues/214), PR: [#1043](https://github.com/OmniSharp/omnisharp-roslyn/pull/1043))
* Fix issue in Cake project system where it attempted to create MetadataReferences for files that don't exist. (PR: [#1045](https://github.com/OmniSharp/omnisharp-roslyn/pull/1045))
* Improvements to the Cake bakery resolver to resolve from both OmniSharp options and PATH. (PR: [#1047](https://github.com/OmniSharp/omnisharp-roslyn/pull/1047))
* Ensure that the Cake.Core assembly is not locked on disk when loading the host object type. (PR: [#1044](https://github.com/OmniSharp/omnisharp-roslyn/pull/1044))
* Added internal support for watching for changes by file extension. (PR: [#1053](https://github.com/OmniSharp/omnisharp-roslyn/pull/1053))
* Watch added/removed .cake-files and update workspace accordingly. (PR: [#1054] (https://github.com/OmniSharp/omnisharp-roslyn/pull/1054))
* Watch added/removed .csx-files and update workspace accordingly. (PR: [#1056] (https://github.com/OmniSharp/omnisharp-roslyn/pull/1056))
* Updated `Cake.Scripting.Transport` dependencies to 0.2.0 in order to improve performance when working with Cake files. (PR: [#1057](https://github.com/OmniSharp/omnisharp-roslyn/pull/1057))

## [1.27.2] - 2017-11-10

* Addressed problem with Sdk-style projects not being loaded properly in certain cases. ([omnisharp-vscode#1846](https://github.com/OmniSharp/omnisharp-vscode/issues/1846), [omnisharp-vscode#1849](https://github.com/OmniSharp/omnisharp-vscode/issues/1849), PR: [#1021](https://github.com/OmniSharp/omnisharp-roslyn/pull/1021))

## [1.27.1] - 2017-11-09

* Fix to allow signature help return results for attribute constructors. ([omnisharp-vscode#1814](https://github.com/OmniSharp/omnisharp-vscode/issues/1814), PR: [#1007](https://github.com/OmniSharp/omnisharp-roslyn/pull/1007))
* Make `--zero-based-indices` command line argument work again. (PR: [#1015](https://github.com/OmniSharp/omnisharp-roslyn/pull/1015))
* Fix serious regression introduced in 1.27.0 that causes projects to fail to load on macOS or Linux. (PR: [#1017](https://github.com/OmniSharp/omnisharp-roslyn/pull/1017)]
* Fixed issue with discovering MSBuild under Mono even when it is missing. ([#1011](https://github.com/OmniSharp/omnisharp-roslyn/issues/1011), PR: [#1018](https://github.com/OmniSharp/omnisharp-roslyn/pull/1018))
* Fixed issue to not use Visual Studio 2017 MSBuild if it is from VS 2017 RTM. ([#1014](https://github.com/OmniSharp/omnisharp-roslyn/issues/1014), PR: [#1018](https://github.com/OmniSharp/omnisharp-roslyn/pull/1018))

## [1.27.0] - 2017-11-07

* Significant changes made to the MSBuild project system that fix several issues. (PR: [#1003](https://github.com/OmniSharp/omnisharp-roslyn/pull/1003))
  * Package restores are now better detected. ([omnisharp-vscode#1583](https://github.com/OmniSharp/omnisharp-vscode/issues/1583), [omnisharp-vscode#1661](https://github.com/OmniSharp/omnisharp-vscode/issues/1661), [omnisharp-vscode#1785](https://github.com/OmniSharp/omnisharp-vscode/issues/1785))
  * Metadata references are properly removed from projects in the OmniSharpWorkspace when necessary.
  * File watching/notification now handles paths case-insensitively.
  * MSBuild project system now loads projects asynchronously after OmniSharp has finished initializing.

## [1.26.3] - 2017-11-10

* Addressed problem with Sdk-style projects not being loaded properly in certain cases. ([omnisharp-vscode#1846](https://github.com/OmniSharp/omnisharp-vscode/issues/1846), [omnisharp-vescode#1849](https://github.com/OmniSharp/omnisharp-vscode/issues/1849), PR: [#1021](https://github.com/OmniSharp/omnisharp-roslyn/pull/1021))

## [1.26.2] - 2017-11-09

* Fixed issue with discovering MSBuild under Mono even when it is missing. ([#1011](https://github.com/OmniSharp/omnisharp-roslyn/issues/1011), PR: [#1016](https://github.com/OmniSharp/omnisharp-roslyn/pull/1016))
* Fixed issue to not use Visual Studio 2017 MSBuild if it is from VS 2017 RTM. ([#1014](https://github.com/OmniSharp/omnisharp-roslyn/issues/1014), PR: [#1016](https://github.com/OmniSharp/omnisharp-roslyn/pull/1016))

## [1.26.1] - 2017-11-04

* Fixed issue with locating MSBuild when running OmniSharp on Mono on Windows. (PR: [#1001](https://github.com/OmniSharp/omnisharp-roslyn/pull/1001))
* Fixed problem where the Antlr4.CodeGenerator Nuget package would not generate files during OmniSharp design-time build. ([omnisharp-vscode#1822](https://github.com/OmniSharp/omnisharp-vscode/issues/1822), PR: [#1002](https://github.com/OmniSharp/omnisharp-roslyn/pull/1002))
* Fixed issue where a C# project referencing a non-C# project would cause the referenced project to be loaded (causing OmniSharp to potentially treat it as C#!). ([omnisharp-vscode#371](https://github.com/OmniSharp/omnisharp-vscode/issues/371), [omnisharp-vscode#1829](https://github.com/OmniSharp/omnisharp-vscode/issues/1829), PR: [#1005](https://github.com/OmniSharp/omnisharp-roslyn/pull/1005))

## [1.26.0] - 2017-10-27

* Cake support added! (PR: [#932](https://github.com/OmniSharp/omnisharp-roslyn/pull/932))
* csproj-based C# scripts are now supported. (PR: [#980](https://github.com/OmniSharp/omnisharp-roslyn/pull/980))
* Updated to Roslyn 2.4.0 packages. (PR: [#998](https://github.com/OmniSharp/omnisharp-roslyn/pull/998))
* MSBuild SdkResolvers now ship with OmniSharp, allowing it to correctly locate the .NET Core SDK for a particular project. (PR: [#974](https://github.com/OmniSharp/omnisharp-roslyn/pull/974))
* Big improvements in OmniSharp's process for located MSBuild 15.0 and MSBuild toolsets on the machine. (PR: [#988](https://github.com/OmniSharp/omnisharp-roslyn/pull/988)
* Updated `/filesChanged` endpoint to allow the client to describe the type of file change (create, delete or change). If a client provides this extra information, files are properly removed and added to the workspace. (PR: [#987](https://github.com/OmniSharp/omnisharp-roslyn/pull/987))
* Improved filtering in `/findsymbols` to include substring matches. (PR: [#990](https://github.com/OmniSharp/omnisharp-roslyn/pull/990))
* `/autocomplete` end point now takes a `TriggerCharacter` property that can be used to trigger completion after a SPACE character. (PR: [#975](https://github.com/OmniSharp/omnisharp-roslyn/pull/975))
* Fix issue with port number not being used when passed as command line argument. (PR: [#971](https://github.com/OmniSharp/omnisharp-roslyn/pull/971))

## [1.25.0] - 2017-09-22

* Major refactoring to split OmniSharp into two servers for each supported protocol: one for HTTP, and one for STDIO. (PR: [#854](https://github.com/OmniSharp/omnisharp-roslyn/pull/854))
* Fixed a bug where language version was not correctly read from .csproj projects. ([#961](https://github.com/OmniSharp/omnisharp-roslyn/issues/961))
* Fixed issue where signing key file was not propogated to OmniSharpWorkspace correctly.

## [1.24.0] - 2017-08-31

* Fixed a bug where an external code action DLL with missing dependencies would crash OmniSharp.
* When running a test via 'dotnet vstest' support, pass "--no-restore" when building with the .NET CLI to ensure that implicit restore does not run, making build a bit faster. ([#942](https://github.com/OmniSharp/omnisharp-roslyn/issues/942))
* Add support for specifying the 'TargetFrameworkVersion' to the 'dotnet vstest' endpoints. ([#944](https://github.com/OmniSharp/omnisharp-roslyn/issues/944))
* Do not throw an exception when attempting to "go to definition" on a namespace

## [1.23.2] - 2017-08-14

* Set CscToolExe to 'csc.exe' to address issues with older Mono installations where the MSBuild targets have set it to 'mcs.exe'.

## [1.23.1] - 2017-08-08

* Fixed two regressions with MSBuild projects:
  1. .NET Core projects were not properly processed if Mono was installed.
  2. When Mono is installed, don't set `MSBuildExtensionsPath` to `$mono_prefix/xbuild` unless both `$mono_prefix/msbuild` and `$mono_prefix/xbuild/15.0` also exist.
* Properly set new language version values to support C# 7.1.

## [1.23.0] - 2017-08-07

Note: This release now requires the latest release of Mono 5.2.0 or later to build and run. In addition, there are now six flavors built for every release:

* Windows builds that run on Desktop CLR.
    * omnisharp-win-x86.zip
    * omnisharp-win-x64.zip
* A *Nix build that be run on Mono 5.2.0 or greater. (Note that the `--assembly-loader=strict` flag must be specified when launch this build with Mono).
    * omnisharp-mono.tar.gz
* Standalone builds for OSX and Linux that include the Mono bits necessary to run OmniSharp.
    * omnisharp-osx.tar.gz
    * omnisharp-linux-x86.tar.gz
    * omnisharp-linux-x64.tar.gz

#### Detailed Changes

* Updated detection of Mono path to p/invoke into `real_path` in `libc` to properly resolve symlinks. (PR: [#911](https://github.com/OmniSharp/omnisharp-roslyn/pull/911))
* Fixed a Script project system regression introduced as part of [#898](https://github.com/OmniSharp/omnisharp-roslyn/pull/898), that caused CSX support to break for Desktop CLR scripts on Windows (PR: [#913](https://github.com/OmniSharp/omnisharp-roslyn/pull/913))
* Set `DOTNET_UI_LANGUAGE` environment variable while running `dotnet --info` to ensure that the output is not localized. (PR: [#914](https://github.com/OmniSharp/omnisharp-roslyn/pull/914))
* OmniSharp now targets net46 by default. ([#666](https://github.com/OmniSharp/omnisharp-roslyn/pull/666), PR: ([#915](https://github.com/OmniSharp/omnisharp-roslyn/pull/915)))
* Fixed typo in help output. (PR: [#916](https://github.com/OmniSharp/omnisharp-roslyn/pull/916))
* xUnit updated to latest 2.3.0 nightly beta, fixing running of xUnit tests inside VS 2017. (PR: [#917](https://github.com/OmniSharp/omnisharp-roslyn/pull/917))
* Fix solution parsing (again!) by introducing custom solution parsing API. ([omnisharp-vscode#1645](https://github.com/OmniSharp/omnisharp-vscode/issues/1645), PR: [#918](https://github.com/OmniSharp/omnisharp-roslyn/pull/918))
* Globally set various MSBuild properties to better support Mono-based projects. ([#892](https://github.com/OmniSharp/omnisharp-roslyn/issues/892), [omnisharp-vscode#1597](https://github.com/OmniSharp/omnisharp-vscode/issues/1597), [omnisharp-vscode#1624](https://github.com/OmniSharp/omnisharp-vscode/issues/1624), [omnisharp-vscode#1396](https://github.com/OmniSharp/omnisharp-vscode/issues/1396), PR: [#923](https://github.com/OmniSharp/omnisharp-roslyn/pull/923))
* Big changes to the build which improve build performance and move OmniSharp to Mono 5.2.0. (PR: [#924](https://github.com/OmniSharp/omnisharp-roslyn/pull/924))
* Update to Roslyn 2.3.0 packages. (PRs: [#930](https://github.com/OmniSharp/omnisharp-roslyn/pull/930), [#931](https://github.com/OmniSharp/omnisharp-roslyn/pull/931))

## [1.22.0] - 2017-07-07

* Allow go to definition to work from metadata as source. ([#876](https://github.com/OmniSharp/omnisharp-roslyn/issues/876), PR: [#883](https://github.com/OmniSharp/omnisharp-roslyn/pull/883))
* Support added for referencing NuGet packages in C# scripts. (PR: [#813](https://github.com/OmniSharp/omnisharp-roslyn/pull/813))
* Use MSBuild solution parsing API which is the official parser for handling weird solution file cases. ([omnisharp-vscode#1580](https://github.com/OmniSharp/omnisharp-vscode/issues/1580), PR: [#897](https://github.com/OmniSharp/omnisharp-roslyn/pull/897))
* Improvements to logic that computes code fixes and refactorings. (PR: [#877](https://github.com/OmniSharp/omnisharp-roslyn/pull/899))
* Update to Roslyn 2.3.0-beta2, which brings support for C# 7.1. (PRs: [#900](https://github.com/OmniSharp/omnisharp-roslyn/pull/900) and [#901](https://github.com/OmniSharp/omnisharp-roslyn/pull/901))
* Ensure that all project systems support an "Enabled" property that can be configured in omnisharp.json. (PR: [#902](https://github.com/OmniSharp/omnisharp-roslyn/pull/902))
* Change MSBuild project system to call the "Compile" target rather than the "ResolveReferences" target, allowing targets that generate files to run. ([omnisharp-vscode#1531](https://github.com/OmniSharp/omnisharp-vscode/issues/1531))
* Update MSBuild to latest version ([#904](https://github.com/OmniSharp/omnisharp-roslyn/pull/904), PR: [#907](https://github.com/OmniSharp/omnisharp-roslyn/pull/907))
* Added binding redirects for MSBuild, fixing issues with custom MSBuild tasks built with different versions of MSBuild. ([#903](https://github.com/OmniSharp/omnisharp-roslyn/issues/903))
* System.dll is now added correctly for C# scripts targeting .NET Framework ([omnisharp-vscode#1581](https://github.com/OmniSharp/omnisharp-vscode/issues/1581), PR: [#898](https://github.com/OmniSharp/omnisharp-roslyn/pull/898))

## [1.21.0] - 2017-06-07

* Moved back to NuGet 4.0.0 RTM packages. This will help alleviate problems with using OmniSharp with .NET Core 2.0-preview2 builds ([#865](https://github.com/OmniSharp/omnisharp-roslyn/issues/865), PR: [#885](https://github.com/OmniSharp/omnisharp-roslyn/pull/885)).

## [1.20.0] - 2017-06-02

* **Breaking Change**: When using environment variables to configure OmniSharp, they must be prefixed by 'OMNISHARP_', which helps ensure that OmniSharp will not unintentionally consume other environment variables (such as 'msbuild') if they happen to be set. See [Configuration Options](https://github.com/OmniSharp/omnisharp-roslyn/wiki/Configuration-Options) for more details on configuring OmniSharp. ([omnisharp-vscode#1512](https://github.com/OmniSharp/omnisharp-vscode/issues/1512), PR: [#872](https://github.com/OmniSharp/omnisharp-roslyn/pull/872))
* The `/findimplementations` endpoint now uses the Roslyn [`SymbolFinder.FindDerivedClassesAsync(...)`](http://source.roslyn.io/#Microsoft.CodeAnalysis.Workspaces/FindSymbols/SymbolFinder_Hierarchy.cs,dbb07fa6e6e5a08c) API and has been updated to work on CSX files. (PR: [#870](https://github.com/OmniSharp/omnisharp-roslyn/pull/870))
* Better handling when loading assemblies from an external folder, such as when a 'RoslynExtensions' path is specified. (PR: [#866](https://github.com/OmniSharp/omnisharp-roslyn/pull/866))
* Fix issue with loading Unity projects by allowing the MSBuild project system to assume that any project with the `.csproj` extension is a C# project. (PR: [#873](https://github.com/OmniSharp/omnisharp-roslyn/pull/873))
* Handle situations where `dotnet` doesn't run properly better. ([omnisharp-vscode#1532](https://github.com/OmniSharp/omnisharp-vscode/issues/1532), PR: [#879](https://github.com/OmniSharp/omnisharp-roslyn/pull/879))
* `IsSuggestionMode` property added to `/autocomplete` endpoint response to indicate when a completion list should not be committed aggressively. (PR: [#822](https://github.com/OmniSharp/omnisharp-roslyn/pull/882))

## [1.19.0] - 2017-05-19

* Update to latest MSBuild, NuGet and Roslyn packages (PR: [#867](https://github.com/OmniSharp/omnisharp-roslyn/pull/867))
* Fix a few issues with the `/autocomplete` end point (PR: [#868](https://github.com/OmniSharp/omnisharp-roslyn/pull/868))

## [1.18.1] - 2017-05-18

* Updated github api key to allow travis to publish releases

## [1.18.0] - 2017-05-17

* Use correct host object in CSX files (matching the same object used by CSI.exe). (PR #846)
* Options can now be set in an omnisharp.json to specify the Configuration (e.g. Debug) and Platform (e.g. AnyCPU) that MSBuild should use. (#202, PR: #858)
* Support for MSTest in the OmniSharp test endpoints. ([omnisharp-vscode#1482](https://github.com/OmniSharp/omnisharp-vscode/issues/1482), PR: #856)
* Fix regression introduced in v1.17.0 that could cause an `ArgumentNullException` (PR: #857)
* Fix issue with package references reporting an 'unresolved dependency' when the reference and dependency differed by case. (PR #861).
* Clean up unresolved dependency detection and improve logging to help diagnosing of dependency issues. ([omnisharp-vscode#1272](https://github.com/OmniSharp/omnisharp-vscode/issues/1272), PR: #862)
* Added new `RoslynExtensions` option to allow specifying a set of assemblies that OmniSharp will look in to find Roslyn extensions to load. (PR: #848)

## [1.17.0] - 2017-05-04

* Use Roslyn completion service for `/autocomplete` endpoint. This brings several completion improvements, such as completion for object initializer members, named parameters, CREFs, etc. (PR: #840)
* OmniSharp no longer deploys MSBuild SDKs for .NET Core projects. Instead, it uses the SDKs from the .NET Core SDK that is installed on the machine.  (#765, PR: #847)

## [1.16.1] - 2017-05-02

* Fix regression that breaks support for multi-project Unity solutions. (#839, PR: #829)
* Ensure that `/gotodefinition` and `/findsymbols` endpoints prefer the "body part" of a partial method. (PR: #838)

## [1.16.0] - 2017-04-28

* Support Metadata as Source for Go To Definition in CSX files. (#755, PR: #829)
* Cleaned up OmniSharp.Abstractions public surface area. (PR: #830)
* MSBuild project system can load referenced projects outside of OmniSharp's target directory. ([omnisharp-vscode#963](https://github.com/OmniSharp/omnisharp-vscode/issues/963), PR: #832)
* Fix 'dotnet test' support when test as "DisplayName". ([omnisharp-vscode#1426](https://github.com/OmniSharp/omnisharp-vscode/issues/1426), PR: #833)
* Fix 'dotnet test' support when multiple tests have similar names. ([omnisharp-vscode#1432](https://github.com/OmniSharp/omnisharp-vscode/issues/1432), PR: #833)
* Add support for NUnit testing in test endpoints. ([omnisharp-vscode#1434](https://github.com/OmniSharp/omnisharp-vscode/issues/1434), PR: #834)
* Add support for a few more Linux distros, namely ubuntu16.10, fedora24, and opensuse42.1. (#639, #658, PR: #835)

## [1.15.0] - 2017-04-18

* If VS 2017 is on the current machine, use the MSBuild included with VS 2017 for processing projects. ([omnisharp-vscode#1368](https://github.com/OmniSharp/omnisharp-vscode/issues/1368), PR: #818)
* Further updates to support debugging and 'dotnet test' (PR: #821, #824)

## [1.14.0] - 2017-04-06

* Properly handle package references with version ranges in .csproj (PR: #814)
* Fix regression with MSBuild project system where a project reference and a binary reference could be added for the same assembly, causing ambiguity errors (#795, PR: #815)
* More improvements for 'dotnet test' support, including a TestMessage event for test runner output and debugging support for VS Test (PR: #816)

## [1.13.0] - 2017-04-04

* Fix problem with hitting ulimit when watching for omnisharp.json file changes on OSX/Linux. (PR# 812)

## [1.12.0] - 2017-03-31

* Fix null reference exception in DotNetProjectSystem when project reference is invalid (PR: #797)
* Stop spamming log from ScriptProjectSystem on ProjectModel requests (PR: #798)
* Initial work to watch changes in omnisharp.json file while OmniSharp is running. This currently supports changes to formatting options. (PR: #804)
* Add support for /v2/runtest endpoint with .csproj-based .NET Core projects ([omnisharp-vscode#1100](https://github.com/OmniSharp/omnisharp-vscode/issues/1100), PR: #808)
* Add support for global omnisharp.json file (#717, PR# 809)

## [1.11.0] - 2017-03-10

- Code Actions now respects the formatting options that were set when OmniSharp was launched. (#759, PR: #770)
- Unsafe code is now allowed in C# scripts (PR: #781)
- C# scripting now ignores duplicated CorLibrary types, which can manifest in certain edge scenarios. (#784, PR: #785)
- Updated to RTM Roslyn and NuGet packages (PR: #791)
-     Introduce caching for #r to avoid leaking memory in C# scripts. ([omnisharp-vscode/issues/1306](https://github.com/OmniSharp/omnisharp-vscode/issues/1306), PR: #794)

## [1.10.0] - 2017-02-11

Note: This release begins a semantic versioning scheme discussed at https://github.com/OmniSharp/omnisharp-roslyn/issues/757.

- Scripting project system now delegates more work to the Roslyn `ScriptSourceResolver`, greatly simplifying the scripting workspace, and adding support for multiple `#load` directives and live updating of `#r` and `#load` directives. ([#227](https://github.com/OmniSharp/omnisharp-roslyn/issues/227), [#689](https://github.com/OmniSharp/omnisharp-roslyn/issues/689), PR: [#760](https://github.com/OmniSharp/omnisharp-roslyn/pull/760))
- Ensure that the DotNetProjectSystem is initialized with the Roslyn `DefaultAssemblyIdentityComparer.Default` to allow assembly references to unify properly. ([omnisharp-vscode#1221](https://github.com/OmniSharp/omnisharp-vscode/issues/1221), PR: [#763](https://github.com/OmniSharp/omnisharp-roslyn/pull/763))
- Also use Roslyn's `DefaultAssemblyIdentityComparer.Default` for scripting as well. (PR: [#764](https://github.com/OmniSharp/omnisharp-roslyn/pull/764))
