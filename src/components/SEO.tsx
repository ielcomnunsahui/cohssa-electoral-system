import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultMeta = {
  title: "ISECO - Independent Students Electoral Committee",
  description: "Official election platform for the College of Health Sciences Students Association (COHSSA) at Al-Hikmah University, Ilorin. Register to vote, apply as candidate, and view election results.",
  keywords: "ISECO, COHSSA, Al-Hikmah University, student elections, voting, electoral committee, health sciences, Nigeria university elections",
  image: "/og-image.png",
  url: "https://iseco.lovable.app",
  type: "website"
};

export const SEO = ({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = defaultMeta.type,
}: SEOProps) => {
  const pageTitle = title 
    ? `${title} | ISECO - COHSSA Elections`
    : defaultMeta.title;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="ISECO - Al-Hikmah University" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
