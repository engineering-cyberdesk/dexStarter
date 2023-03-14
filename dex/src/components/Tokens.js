import React from 'react'

import tokenList from "../tokenList.json"
function Tokens() {
  return (
   <div className='tokensBox'>
      <div className='tradeBoxHeader'>
        <h4>Available Tokens For Swapping</h4>
      </div>
{tokenList?.map((token, index) => {
          return (
            <div className='tokenAvailableRow' key={index}>
              <img src={token.img} alt={token.ticker} className="tokenLogo" />

                <div className='tokenName'>{token.name}</div>
                <div className='tokenTicker'>{token.ticker}</div>
                </div>
          )
        })}
      </div>
  )
}

export default Tokens