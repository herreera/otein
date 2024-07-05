import './globals.css';
import Footer from '@app/components/Layout/Footer';
import Header from '@app/components/Layout/Header';
import { ClientProvider } from '@app/components/Provider/ClientProvider';
import { SidebarUI } from '@app/components/Sidebar/SidebarUI';
import { NotPremium } from '@app/components/NotPremium/NotPremium';
import { LoginModal } from '@app/components/LoginModal/LoginModal';

/**
 * Using force dynamic so changes in business assets (e.g. services) are immediately reflected.
 * If you prefer having it reflected only after redeploy (not recommended) please remove it
 * **/
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Otein - Merchandising</title>
        <meta
          name="description"
          content="Página web de Otein"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/d3/be/78/d3be78cd-3165-3a65-0837-3782264a9e62/0.jpg/800x800cc.jpg" />
      </head>
      <body className="text-black bg-site">
        {process.env.NEXT_PUBLIC_WIX_CLIENT_ID ? (
          <>
            <ClientProvider>
              <Header />
              <main className="bg-site min-h-[600px]">{children}</main>
              <SidebarUI />
              <NotPremium />
              <LoginModal />
            </ClientProvider>
            <div className="mt-10 sm:mt-20">
              <Footer />
            </div>
          </>
        ) : (
          <div className="bg-site min-h-[600px] max-w-5xl mx-auto p-5">
            Page not available. Please add an environment variable called
            NEXT_PUBLIC_WIX_CLIENT_ID, containing the client ID, to your
            deployment provider.
          </div>
        )}
      </body>
    </html>
  );
}
