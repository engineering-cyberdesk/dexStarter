import React, { useState, useEffect } from 'react'
import { Input, Popover, Radio, Modal, message } from "antd"
import { ArrowDownOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons"

import tokenList from "../tokenList.json"
import axios from "axios"

import { usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from "wagmi"


function Swap(props) {
  const address = props.address;
  const isConnected = props.isConnected;
  const [slippage, setSlippage] = useState(2.5);
  const [messageApi, contextHolder] = message.useMessage();
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null
  });
  const { config, error } = usePrepareSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value)
    }
  });
  const { sendTransaction } = useSendTransaction(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: config?.hash
  });

  const handleSetSlippage = (event) => {
    setSlippage(event.target.value);
  }

  const changeAmount = (event) => {
    setTokenOneAmount(event.target.value);
    if (event.target.value && prices) {
      setTokenTwoAmount((event.target.value * prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null)
    }
  }

  const switchTokens = () => {
    setPrices(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    setTokenTwo(one);
    setTokenOne(two);
    fetchPrices(two.address, one.address);

  }
  const modifyToken = (index) => {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    setIsOpen(false);
    if (changeToken === 1) {
      setTokenOne(tokenList[index]);
      fetchPrices(tokenList[index].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[index]);
      fetchPrices(tokenOne.address, tokenList[index].address);
    }
    
  }
  const openModal = (index) => {
    setChangeToken(index);
    setIsOpen(true);
  }

  const fetchPrices = async (t1, t2) => {
    const res = await axios.get(`http://localhost:3001/tokenPrice`,
      {
        params: { addressOne: t1, addressTwo: t2 }
      });
    setPrices(res.data);
  }

  const fetchDexSwap = async () => {
    const allowance = await axios.get(`https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`);

    if (allowance.data.allowance === '0') {
      const approval = await axios.get(`https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${tokenOne.address}`);
      setTxDetails(approval.data);
      console.log("not approved");
      return;
    }
    const tx = await axios.get(`https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length, '0')}&fromAddress=${address}&slippage=${slippage}`)
    let decimals = Number(`1E${tokenTwo.decimals}`);
    setTokenTwoAmount((Number(tx.data.toTokenAmount) / decimals).toFixed(2));

    setTxDetails(tx.data.tx);
    
  }
  const settings = <>
    <div>Slippage Tolerance</div>
    <div>
      <Radio.Group value={slippage} onChange={handleSetSlippage}>
        <Radio.Button value={0.5}>0.5%</Radio.Button>
        <Radio.Button value={2.5}>2.5%</Radio.Button>
        <Radio.Button value={5.0}>5.0%</Radio.Button>
      </Radio.Group>
    </div>
  </>

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, [])

  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails])

  useEffect(() => {
    messageApi.destroy();
    if (isLoading) {
      messageApi.open({
        type: 'loading',
        content: 'Transaction is pending...',
        duration: 0,
      })
    }
  }, [isLoading])
  useEffect(() => {
    messageApi.destroy();
    if (isSuccess) {
      messageApi.open({
        type: 'success',
        content: 'Transaction was successful',
        duration: 1.5
      })
    } else if (txDetails.to) {
      messageApi.open({
        type: 'error',
        content: 'Transaction has failed',
        duration: 1.5
      })
    }
  },[isSuccess])

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className='modalContent'>{tokenList?.map((token, index) => {
          return (
            <div className='tokenChoice' key={index} onClick={() => modifyToken(index)}>
              <img src={token.img} alt={token.ticker} className="tokenLogo" />
              <div className='tokenChoiceNames'>
                <div className='tokenName'>{token.name}</div>
                <div className='tokenTicker'>{token.ticker}</div>
                </div>
              </div>
          )
        })}</div>
      </Modal>
    <div className='tradeBox'>
      <div className='tradeBoxHeader'>
        <h4>Swap</h4>
        <Popover title="Settings" trigger="click" placement='bottomRight' content={settings}>
          <SettingOutlined className="cog" />
        </Popover>
      </div>
      <div className='inputs'>
          <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount} disabled={!prices} />
        <Input placeholder='0' value={tokenTwoAmount} disabled />
        <div className="switchButton" onClick={switchTokens}>
          <ArrowDownOutlined className="switchArrow"/>
        </div>
        <div className='assetOne' onClick={()=>openModal(1)}>
          <img src={tokenOne.img} alt="assetOneLogo" className='assetLogo' />
          {tokenOne.ticker}
          <DownOutlined/>
        </div>
        <div className='assetTwo' onClick={()=> openModal(2)}> 
          <img src={tokenTwo.img} alt="assetTwoLogo" className='assetLogo' />
          {tokenTwo.ticker}
          <DownOutlined/>
        </div>
        </div>
        <div className='swapButton' disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
      </div>
      </>
  )
}

export default Swap