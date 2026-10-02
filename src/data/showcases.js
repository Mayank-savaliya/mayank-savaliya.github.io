export const showcases = [
  {
    id: "news",
    title: "AlmaConnect News",
    subtitle: "News intelligence",
    url: "https://news.almaconnect.com/",
  },
  {
    id: "data-mine",
    title: "DataMine",
    subtitle: "Alumni data enrichment",
    url: "https://news.almaconnect.com/data-mine",
  },
  {
    id: "institutions",
    title: "AlmaConnect for Institutions",
    subtitle: "Connected alumni communities",
    url: "https://www.almaconnect.com/for-institutions",
  },
  {
    id: "companies",
    title: "AlmaConnect for Companies",
    subtitle: "Corporate alumni networks",
    url: "https://www.almaconnect.com/for-companies",
  },
].map((project) => {
  const newspaper =
    {
      news: "news-portrait",
      "data-mine": "data-mine-wide",
    }[project.id] || project.id;
  const base = `${import.meta.env.BASE_URL}showcases/`;
  return {
    ...project,
    video: `${base}${project.id}.mp4`,
    poster: `${base}${project.id}.jpg`,
    newspaperVideo: `${base}${newspaper}.mp4`,
    newspaperPoster: `${base}${newspaper}.jpg`,
  };
});
