import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { launchConfig } from "@/config/launch";

export const metadata: Metadata = {
  title: {
    default: "配信設定",
    template: "%s | 前田からの配信設定",
  },
  description: "受け取りたい情報を選択できる配信設定ページです。",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = launchConfig.analytics.gtmId;
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {gtmId ? (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}
