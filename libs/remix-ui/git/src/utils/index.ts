export const removeSlash = (s: string) => {
  return s.replace(/^\/+/, "");
};

export const removeGitFromUrl = (url: string) => {
  return url.replace(/\.git$/, "");
}