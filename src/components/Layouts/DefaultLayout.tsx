"use client";
import React, { useState, ReactNode, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Cookies from 'js-cookie'
import { setCookie } from "cookies-next";
import fetchToFrontServer_csr from "@/boaUtil/fetchToFrontServer_csr";
import Sidebar2 from "../Sidebar/index2";
import Header2 from "../Header/index2";

export default function DefaultLayout({
  children, cookies='', type='boa'
}: {
  children: React.ReactNode, cookies?:any, type?:any
}) {

  // console.log("Defalutlayout :: " + cookies)

  useEffect(() => {
    if(cookies){
      const cookiesRes = fetchToFrontServer_csr.boaPost('/api/cookie/set', {cookies : cookies}).then((res)=>{
       })
      
    }
  
  }, [])


  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>

      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex">
        {/* <!-- ===== Sidebar Start ===== --> */}
        {type == 'boa' ? <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> : <Sidebar2 sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>}
        {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col lg:ml-72.5">
          {/* <!-- ===== Header Start ===== --> */}
          {type == 'boa' ?  <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> :  <Header2 sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
         
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl  p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}

    </>
   
  );
}
