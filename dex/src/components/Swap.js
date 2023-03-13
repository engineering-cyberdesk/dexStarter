import React, {useState} from 'react'
import { Input, Popover, Radio, Modal, message } from "antd"
import { ArrowDownOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons"


function Swap() {
  return (
    <div className='tradeBox'>
      <div className='tradeBoxHeader'>
        <h4>Swap</h4>
        <Popover title="Settings" trigger="click" placement='bottomRight'>
          <SettingOutlined className="cog" />
          </Popover>
      </div>
    </div>
  )
}

export default Swap