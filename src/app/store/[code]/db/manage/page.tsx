'use client'
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import fetchToFrontServer from "@/boaUtil/fetchToFrontServer_csr";
import {formatDate, formatTimeStamp} from "@/boaUtil/dateUtil";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/paging/Pagination";
import useDebounce from "@/hooks/useDebounce";
import SearchBox from "@/components/searchBox/SearchBox";
import Datepicker from "react-tailwindcss-datepicker";
import Tooltip from "@/components/Tooltip/tooltip";
import { STORE_STATUS } from "@/constants/codeList";
import { checkIsExpire } from "@/boaUtil/tokenExpireCheckUtil";
import * as XLSX from 'xlsx';
import useLocalStorage from "@/hooks/useLocalStorage";


//import { cookies } from "next/headers";

function generateExcel(column_name_arr : any, data_arr : any, file_name : any) {
  const workbook = XLSX.utils.book_new();
  const ws_data = [column_name_arr].concat(data_arr);
  console.log(ws_data)
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(workbook, worksheet, '디비리스트');
  XLSX.writeFile(workbook, file_name+'.xlsx');
}


const Page = (props:any) => {


  const [alldata, setAllData] = useState<any[]>([]); // 초기 전체 데이터
  const [pagingInfo, setPagingInfo] = useState<Record<string,any>>({}); // 검색어 상태 관리
  const [checkList, setCheckList] = useState<any[]>([]); // 초기 전체 데이터

  const [roundInfoList, setRoundInfoList] = useState<any[]>([])
  const [selectedRound, setSelectedRound] = useState('all')
  const [allCheckTF, setAllCheckTF] = useState(false);

  const [statusList, setStatusList] = useState<any[]>([])//(Object.values(STORE_STATUS));
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [current_store_name, setCurrent_store_name] = useLocalStorage('current_store_name', '');

  const store_code = props.params.code;
  
  let today = new Date()
  let before30day = new Date()
  before30day.setDate(today.getDate() - 60);

  const [dateValue, setDateValue] = useState({ 
    startDate: before30day, 
    endDate: today
  });

    // useEffect로 초기 데이터를 fetch

    const fetchData = useCallback((param={}) => {
      fetchdd(param)
    }, []);

  //디비데이터
  const fetchdd = async (param : Record<string,any> = {}) => {
    try {
      const targetUrl = '/api/store/db/manage'

      //다른페이지엗 ㅗ추가해줘야할듯
      const param2 : Record<string,any> = {

        store_code : store_code,
        ...param

      }

      const res = await fetchToFrontServer.boaGet(targetUrl,param2)
      const result = await res.json()

      setAllData(result.data.list); // 원본 데이터를 설정
      const paging = {...result.data.paging, startDate : param2.startDate, endDate:param2.endDate}
      // console.log(paging)
      setPagingInfo(paging)

    } catch (error) {
    }
  };

  //차수데이터
  const fetchdd2 = async (param={}) => {
    try {
      const targetUrl = '/api/store/db/round/info'
      
      const res = await fetchToFrontServer.boaGet(targetUrl,param)
      const result = await res.json()
      setRoundInfoList(result.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    }

    //상태 데이터
    try {
      const targetUrl2 = '/api/store/db/manage/status'
      
      const res2 = await fetchToFrontServer.boaGet(targetUrl2,param)
      const result2 = await res2.json()
      setStatusList(result2.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      const isExpire = await checkIsExpire()

      if(isExpire){            
        window.location.href = '/auth/signout'
        return
      }
      fetchData({store_code : store_code, startDate : formatDate(dateValue.startDate), endDate : formatDate(dateValue.endDate), round_num : selectedRound});
      fetchdd2({store_code : store_code})
    }
    fetchAll()
  }, []);

  const checkboxChange = (isChecked:any, id:any)=>{

    if(isChecked){
      addCheckList(id)
    }else{
      removeCheckList(id)
    }

  }

  const addCheckList = (id :any) => {
    setCheckList([...checkList, id]);
  };

  const removeCheckList = (store_code:any) =>{

    setCheckList(checkList.filter(item => item !== store_code));
  }

  //전체 체크
const onClickAllCheck = () => {

  let updatedCheckboxes = []
  
  if(allCheckTF == false || checkList.length != alldata.length){
    setAllCheckTF(true);
    updatedCheckboxes = alldata?.map((data) => {
      return  data.id 
    });
  }else{
    setAllCheckTF(false);
  }
  setCheckList(updatedCheckboxes);
};

//차수변경
const onClickRoundChangeButton = async () =>{
  const param = {store_code : store_code, idList:checkList, round_num : selectedRound}

  if(selectedRound == "all"){
    alert("차수를 선택하세요")
    return;
  }

  try {
    const targetUrl = '/api/store/db/manage/round'
    const res = await fetchToFrontServer.boaPost(targetUrl,param)
    if(res.ok){
      alert("변경 완료 :: ")
      window.location.reload()
    }else{
      alert("실패 ::: ")
    }


  } catch (error) {
    alert("실패 ::: ")
  }


}

//상태변경
const onClickRoundChangeButton_2 = async () =>{
  const param = {store_code : store_code, idList:checkList, status : selectedStatus}

  if(selectedStatus == "all" || selectedStatus == null){
    alert("상태를 선택하세요")
    return;
  }

  try {
    const targetUrl = '/api/store/db/manage/status/update'
    const res = await fetchToFrontServer.boaPost(targetUrl,param)
    if(res.ok){
      alert("변경 완료 :: ")
      window.location.reload()
    }else{
      alert("실패 ::: ")
    }


  } catch (error) {
    alert("실패 ::: ")
  }


}


  const onClickStatusButton = async(status:any)=>{
    const param = {status : status, storeCodeList : checkList}


    if(checkList.length == 0){
      alert("체크된 리스트 없음 :: ")
      return
    }

    try {
      const targetUrl = '/api/admin/client/store/status'
      const res = await fetchToFrontServer.boaPost(targetUrl,param)
      if(res.ok){
        alert("변경 완료 :: ")
        window.location.reload()
      }else{
        alert("실패 ::: ")
      }


    } catch (error) {
      alert("실패 ::: ")
    }
  
  }




  return (

    <DefaultLayout type={'store'}>
    <Breadcrumb pageName="디비관리" />

    <div className="mb-6">
      <SearchBox fetchData={fetchData} placeholder={"검색어 입력"}
       param={{...pagingInfo, pageNum : null , startDate : formatDate(dateValue.startDate), endDate : formatDate(dateValue.endDate)}}></SearchBox> 

    </div>


    
    <div className="gap-3 flex-wrap ">

    <div className="flex items-center gap-5">
      <div className="w-2/3">
      <Datepicker 
      value={dateValue} 
      onChange={(newValue:any) => {
        setDateValue({startDate:newValue.startDate, endDate:newValue.endDate})
      }} /> 
      </div>

      <button type="button" className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" 
        onClick={()=>{ fetchData({store_code : store_code, ...pagingInfo, pageNum : null, round_num: null, status:null, startDate : formatDate(dateValue.startDate), endDate : formatDate(dateValue.endDate)}) }}>
          조회</button>
  
    <button 
      onClick={() => {
        window.open(process.env.NEXT_PUBLIC_FRONT_DOMAIN+"/store/"+store_code+"/db/manage/add", 'DB직접추가', 'width=550,height=600');
     }} 
    className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
  >
    DB추가
  </button>

  <button
    onClick={() => {
      if(checkList.length == 0){
        alert("체크박스 선택하세요 ") 
        return
      };
      const list = encodeURIComponent(JSON.stringify(checkList));
      window.open(process.env.NEXT_PUBLIC_FRONT_DOMAIN+"/store/"+store_code+"/db/manage/delivery?list="+list, '상세페이지', 'width=550,height=400');
    }}
    className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
  >
    DB전달
  </button>

  <button
    onClick={() => {
      const column_name_arr =  ["고유", "차수", "상태",  "이름", "연락처", "기타", "메모", "랜딩명", "신청일시", "매체", "이벤트", "등록IP"]
      const data_arr = alldata.filter(obj => obj.status !== '99').map(obj => {
        const status = obj.status ? STORE_STATUS[obj.status as keyof typeof STORE_STATUS].text : ''
        return [obj.id, obj.round_num, status, obj.cust_name, obj.cust_phone_number, obj.info_data, obj.memo, obj.page_name, formatTimeStamp(obj.last_update), obj.media_name, obj.event_name, obj.reg_ip]
      });
      const excel_name = current_store_name + "_" + pagingInfo.startDate + "~" + pagingInfo.endDate+"("+pagingInfo.pageNum+")"
      generateExcel(column_name_arr, data_arr, excel_name)
    }}
    className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
  >
    데이터 엑셀로 다운
  </button>
</div>



    </div>
        
    <br></br>

    <select onChange={(e)=>{setSelectedRound(e.target.value)}}>
     <option value="all">차수전체</option>
      {roundInfoList?.map((item:any, index:any)=>{
         return <option key={index} value={item.round_num}>{item.round_num == 0 ? "차수없음(" + item.count+")" : item.round_num + "차" +"("+item.count+"/"+item.round_quantity+")"}</option>})
      }  
    </select>
  &nbsp;&nbsp;&nbsp;&nbsp;
    <button type="button" className="py-2.5 px-5 me-2 mb-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" 
      onClick={()=>{fetchData({...pagingInfo, pageNum : null, keyword:null, startDate : formatDate(dateValue.startDate), endDate : formatDate(dateValue.endDate), round_num: selectedRound, status:null})}}> 차수조회</button>
   &nbsp;
    <button onClick={()=>{{onClickRoundChangeButton()}}} type="button"
     className="py-2.5 px-5 me-2 mb-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" >
      차수변경</button>

    <br></br>

    <select onChange={(e)=>{setSelectedStatus(e.target.value)}}>
    <option key={"status all"} value="all">상태전체</option>
      {statusList?.map((item:any, index:any)=>{
         return <option key={"status"+index} value={item.status_code}>{item.text+"("+item.count+")"}</option>})
      }
    </select> &nbsp;&nbsp;&nbsp;&nbsp;
    <button type="button" className="py-2.5 px-5 me-2 mb-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" 
      onClick={()=>{fetchData({...pagingInfo, pageNum : null, keyword:null, startDate : formatDate(dateValue.startDate), endDate : formatDate(dateValue.endDate), round_num:null, status:selectedStatus})}}>상태조회</button>
   &nbsp;
    <button type="button" className="py-2.5 px-5 me-2 mb-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" 
      onClick={()=>{onClickRoundChangeButton_2()}}>상태변경</button>

    <br></br>

 
    <div className="flex flex-col gap-10 ">
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
      <div className="overflow-y-auto w-full overflow-x-scroll">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-2 text-center dark:bg-meta-4">
              <th className="min-w-[100px] px-4 py-4 font-medium text-c-blue hover:text-c-blue-2 dark:text-white focus:cursor-auto cursor-pointer">
                <p className="" onClick={()=>{onClickAllCheck()}}>{"[전체선택]"}</p>
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                고유
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                차수
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                상태
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                이름
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                연락처
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                기타
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                메모
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                랜딩명
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
               신청일시
              </th>

              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
               매체
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
               이벤트
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
               등록IP
              </th>
            </tr>
          </thead>
          <tbody>
            {alldata?.map((item, key) => (
              <tr key={key} className="text-center hover:bg-slate-100" 
              onDoubleClick={()=>{window.open(process.env.NEXT_PUBLIC_FRONT_DOMAIN+"/store/"+store_code+"/db/list/detail?id="+item.id, '상세페이지', 'width=550,height=580')}}>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark text-center" onDoubleClick={(e)=>{e.stopPropagation()}} >
                  <input key={key+100} type="checkbox" style={{zoom:1.5}} checked={checkList?.includes(item.id)} onChange={(e)=>{checkboxChange(e.target.checked, item.id)}}></input>

                </td>
                

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark text-center" >
                  <h5 className="text-black dark:text-white">
                    {/* <Link href={process.env.NEXT_PUBLIC_FRONT_DOMAIN+"/boa/client/store/detail?store_code="+item.store_code} rel="noopener noreferrer" target="_blank" className="hover:underline" onClick={(e)=>{
                      e.preventDefault();
                      const target = e.target as HTMLAnchorElement
                      window.open(target.href, '상세페이지', 'width=550,height=700');
                      
                    }}>
                      {item.pageName}
                    </Link> */}
                    {item.id}                
                  </h5>
                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark text-center" >
                  <h5 className="text-black dark:text-white">
                    {item.round_num}차               
                  </h5>
                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                  {item.status ? STORE_STATUS[item.status as keyof typeof STORE_STATUS].text : ''}
                  </p>
                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark " >
                  <h5 className="text-black dark:text-white">
                    {item.cust_name}
                  </h5>
                </td>
                
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.cust_phone_number}
                  </p>
                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">

                  {item.info_data ? <Tooltip message={item.info_data}>
                    <h5 className="text-black dark:text-white">
                      
                        {item.info_data.length > 20 ? item.info_data.substring(0, 15) + '...' : item.info_data}
                     
                    </h5>
                    </Tooltip>

                    : null
                    }

                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">

                  {item.memo ? <Tooltip message={item.memo}>
                    <h5 className="text-black dark:text-white">
                      
                        {item.memo.length > 20 ? item.memo.substring(0, 15) + '...' : item.memo}
                     
                    </h5>
                    </Tooltip>

                    : null
                    }

                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.page_name}
                  </p>
                </td>
                

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {formatTimeStamp(item.last_update)}
                  </p>
                </td>


                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.media_name}
                  </p>
                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.event_name}
                  </p>
                </td>

                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.reg_ip}
                  </p>
                </td>

                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <Pagination pageInfo={pagingInfo} fetchData={fetchData} key={"storeList"}></Pagination>

    
  </DefaultLayout>

  );
};


export default Page;
