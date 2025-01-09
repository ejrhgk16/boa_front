import fetchToBackServer from '@/boaUtil/fetchToBackServer';
import { throws } from 'assert';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic' // defaults to auto
export const dynamicParams = true

export async function POST(req : NextRequest, res: NextResponse) {

  
  const targetUrl = "/boa-s/db/list/detail/update"

  const successCallback = function(result:Record<string, any>){

  }

  const nextRes= await fetchToBackServer.boaPost(targetUrl, req, successCallback);

  return nextRes

}

