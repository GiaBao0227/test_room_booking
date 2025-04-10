// src/utils/slugify.js
export const slugifyWithoutDash = (text) => {
  return (
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "")
      // .replace(/[^\w-]+/g, "")
    //   .replace(/--+/g, "-")
    //   .replace(/^-+/, "")
    //   .replace(/=+$/, "")
  );
};

export const slugifyWithDash = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/=+$/, "");
};
