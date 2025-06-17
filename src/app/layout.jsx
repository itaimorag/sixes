import './globals.css';
import { Toaster } from "@/components/ui/toaster";
export const metadata = {
    title: 'Sixes Scorecard',
    description: 'Track scores for the Shishiyot (Sixes) card game.',
    // Adding viewport meta for better mobile responsiveness, though not strictly required by prompt
    viewport: 'width=device-width, initial-scale=1',
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Alegreya&display=swap" rel="stylesheet"/>
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>);
}
