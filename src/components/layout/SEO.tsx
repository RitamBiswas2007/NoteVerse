import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    type?: string;
    name?: string;
    image?: string;
}

export function SEO({
    title,
    description,
    canonical,
    type = 'website',
    name = 'NoteVerse',
    image = '/og-image.png' // You should add a default og-image to public folder
}: SEOProps) {

    // SEO Recommendation: Ensure titles are unique and brand-appended
    const fullTitle = title.includes(name) ? title : `${title} | ${name}`;

    // SEO Recommendation: Ensure canonical URLs are lowercase
    const normalizedCanonical = canonical?.toLowerCase() || window.location.href.toLowerCase().split('?')[0];

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={normalizedCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={normalizedCanonical} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={name} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
