(async () => {
  const img = document.getElementById("coalitionHeader");
  if (!img) return;

  try {
    const paths = [
      "header-data-0.txt",
      "header-data-1.txt",
      "header-data-2.txt",
      "header-data-3.txt"
    ];
    const parts = await Promise.all(
      paths.map((path) =>
        fetch(path, { cache: "no-store" }).then((response) => {
          if (!response.ok) throw new Error(`Failed to load ${path}`);
          return response.text();
        })
      )
    );
    img.src = "data:image/webp;base64," + parts.join("").replace(/\s+/g, "");
  } catch (error) {
    console.error("Header image failed to load:", error);
    img.alt = "People Over Power Coalition";
  }
})();