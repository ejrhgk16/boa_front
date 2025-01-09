"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { AuthProvider } from '../context/AuthContext';
import useAuthCheck from "@/hooks/useAuthCheck";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const pathname = usePathname();

  let isExcludedPage = false

  if(pathname.indexOf("landing")>-1){
    isExcludedPage=true
  }

  // const pathname = usePathname();
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);


  return (
    <html lang="en">

      {/* <head>
        <script key={12} dangerouslySetInnerHTML={{ __html: aa }} />
      </head> */}


      {
        isExcludedPage == false ?       
        <AuthProvider>
        <body suppressHydrationWarning={true}>
          <div className="dark:bg-boxdark-2 dark:text-bodydark ">
   
            {loading ? <Loader /> : children}
          </div>
        </body>
        </AuthProvider>
        
        :
        <body suppressHydrationWarning={true}>
        <div className="bg-white overflow-x-hidden ">
          {children}
        </div>
      </body>
      }

    </html>
  );
}
