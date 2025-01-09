'use client'
import fetchToFrontServer from "@/boaUtil/fetchToFrontServer_csr";
import { useCallback, useEffect, useState } from "react";
import SelectGroupOne from "@/components/SelectGroup/SelectGroupOne";
import XButtonWithName from "@/components/FormElements/xbutton";

import InputSearchList from "@/components/FormElements/inputSearchList";
import { useRouter, useSearchParams } from "next/navigation";
import SelectOption from "@/components/FormElements/SelectOption";
import { checkIsExpire } from "@/boaUtil/tokenExpireCheckUtil";
//import { cookies } from "next/headers";




const StoreDetail = () => {

  const searchParams = useSearchParams()
  const store_code = searchParams.get('store_code')

 

  const [storeDetail, setStoreDetail] = useState<any>({}); 
  const [connUserList, setConnUserList] = useState<any[]>([]); 
  const [clientTypeList, setClientTypeList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([{value:'Y', text:'활성화'}, {value:'N', text:'비활성화'}]);
  
  const [defaultText, setDefaultText] = useState('');
  

    // useEffect로 초기 데이터를 fetch
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        
        const targetUrl1 = '/api/admin/client/store/detail'
        const targetUrl2 = '/api/admin/client/type/list'

        const [res1, res2] = await Promise.all([fetchToFrontServer.boaGet(targetUrl1, {store_code : store_code}), fetchToFrontServer.boaGet(targetUrl2)])
        
        const result1 = await res1.json()
        const result2 = await res2.json()

        
        setStoreDetail(result1.data)
        setDefaultText(result1.data.admin_name||result1.data.admin_login_id?result1.data.admin_name+"("+result1.data.admin_login_id+")":'')
        
        //클라이언트 타입리스트
        const newData2=result2.data?.map((item : any)=>{
          return {text:item.name, value:item.id}//id= client_type_id
        })
        setClientTypeList(newData2)

        if(result1.data.conn_user_list)setConnUserList(result1.data.conn_user_list)
        else setConnUserList([])
        

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchAll = async () => {
      const isExpire = await checkIsExpire()
      if(isExpire){            
        window.close()
        window.opener.location.href = '/auth/signout'
      }
      fetchData();
    }
    fetchAll()
  }, []);


  const sendData = async ()=>{

    const targetUrl = "/api/admin/client/store/update"

    const body = {
      ...storeDetail,
      conn_user_list : connUserList
    }

    try {
      const res  = await fetchToFrontServer.boaPost(targetUrl, body)
      if(res.ok){
        alert("저장 성공 ::: !")
        window.opener.location.reload()
        window.close()
      }
      else{alert("저장실패 :: !")}
    } catch (error) {
      alert("서버에러 발생 :: !")

    }
    
  }

  const onClickXButtonfnc = (item :any)=>{
    setConnUserList(connUserList.filter(data => data.conn_user_id !== item.conn_user_id));
  }

  const inputSearchFnc =  async (searchWord:any)=>{

    const targetUrl = "/api/common/search/user"
    const param = {searchWord : searchWord}
    const res = await fetchToFrontServer.boaGet(targetUrl, param)
    const result = await res.json()

    if(result.data){
      const newData=result.data?.map((item : any)=>{
        return {text:item.user_name+"("+item.user_login_id+")", value:item.user_login_id}
      })
      return newData
    }else{
      return []
    } 
  }

  const inputSearchItemClickFnc1 = (item:any)=>{ // 관리자계정설정
    setStoreDetail((prevState :any) => ({
      ...prevState,  // 이전 상태를 복사
      admin_login_id: item.value// name 키의 값만 변경
    }));
  }

  const inputSearchItemClickFnc2 = (item:any)=>{ // 연결계정목록설정용


    //중복체크
    const len = connUserList.filter((element)=>{
      if(element.conn_user_id == item.value)return element
    }).length

    if(len>0)return

    item.conn_user_id = item.value

    setConnUserList([...connUserList, item])

  }

  const selectOptionStatus = (value : any)=>{
    setStoreDetail((prevState :any) => ({
      ...prevState,  // 이전 상태를 복사
      status: value   // name 키의 값만 변경
    }));
  }

  const selectOptionClientType = useCallback((value : any)=>{
    setStoreDetail((prevState :any) => ({
      ...prevState,  // 이전 상태를 복사
      client_type_id: value   // name 키의 값만 변경
    }));
  },[])


  const onChangeValue = (name:any, value:any)=>{
    setStoreDetail((prevState :any) => ({
      ...prevState,  // 이전 상태를 복사
      [name]: value   // name 키의 값만 변경
    }));
  }


  return (

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-semibold text-black dark:text-white">
                클라이언트 정보 수정
              </h3>
            </div>
            {/* <form action="#"> */}
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      상점명
                    </label>
                    <input
                      type="text" defaultValue={storeDetail.store_name}
                      onChange={(e)=>{onChangeValue("store_name", e.target.value)}}
                      placeholder="Enter"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <SelectOption subject={"활성화"} optionList={statusList} selectedValue={storeDetail.status} selectFnc={selectOptionStatus} key={"statusSelect"} />

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    담당자
                  </label>

                  <InputSearchList id="1" searchFnc={inputSearchFnc} itemClickFnc={inputSearchItemClickFnc1} defaultValue={defaultText} key={"adnubInputSearch"} ></InputSearchList >
                </div>


                <SelectOption subject={"클라이언트 종류"} optionList={clientTypeList} selectedValue={storeDetail.client_type_id} selectFnc={selectOptionClientType} key={"clientTypeSelect"} />

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    연결 계정 목록
                  </label>
                  <InputSearchList id="2" searchFnc={inputSearchFnc} itemClickFnc={inputSearchItemClickFnc2}  key={"connInputSearch"} type={2}></InputSearchList >
                  <div className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">

                    <div className="flex flex-auto flex-wrap gap-3">

                    {connUserList?.map((item, index)=>{

                      if(!item.conn_user_id && !item.conn_user_name)return
                      
                      item.id = index
                      if(!item.text){
                        item.text = item.conn_user_name+"("+item.conn_user_id+")"
                      }
                      return <XButtonWithName item={item} onClickButtonfnc={onClickXButtonfnc} key={index}></XButtonWithName>
                    
                    }
                    )}

                    </div>

                  </div>
 
                </div>

                {/* <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your message"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div> */}

                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90" onClick={sendData}>
                  저장하기
                </button>
              </div>
            {/* </form> */}
          </div>

  );
};


export default StoreDetail;
