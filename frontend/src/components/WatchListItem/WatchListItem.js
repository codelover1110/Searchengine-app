import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
// import BarChart from 'components/FinancialDashboard/SmallBarChart';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import WatchListEditColumnWidget from 'components/WatchListEditColumnWidget/WatchListEditColumnWidget'
import './WatchListItem.css'
import Select from 'react-select'
import {
  getMultiFinancials, getScannerViewData, saveScannerView, getWatchListAll, getStockModalData
} from 'api/Api';

import { defaultFields } from '../WatchListEditColumnWidget/components/modal/nodes'
import ButtonCsvDownload from 'components/ButtonCsvDownload'

const WatchListItem = (props) => {
  const { allViewData, setAllViewData } = props;
  const [isLoadedWatchListOptions, setIsLoadedWatchListOptions] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState(
    [
      // {
      //   label: "Indicators",
      //   value: "parent_value_2",
      //   children: [
      //     // {
      //     //     label: "rsi",
      //     //     value: "child_value_2_1",
      //     //     default: true
      //     // },
      //     // {
      //     //     label: "rsi2",
      //     //     value: "child_value_2_2",
      //     //     default: true
      //     // },
      //     // {
      //     //     label: "rsi3",
      //     //     value: "child_value_2_3",
      //     //     default: false
      //     // },
      //     // {
      //     //     label: "heik",
      //     //     value: "child_value_2_4",
      //     //     default: false
      //     // },
      //     // {
      //     //     label: "heik2",
      //     //     value: "child_value_2_5",
      //     //     default: false
      //     // }
      //   ],
      //   "default": true
      // }
    ]
  );

  const [chartMultiData, setChartMultiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [isOpenedEditColumnWidget, setIsOpenedEditColumnWidget] = useState(false)
  const [selectedWatchList, setSelectedWatchList] = useState(null)
  const [selectedWatchListOptions, setSelectedWatchListOptions] = useState([])
  const [selectedAggregationType, setSelectedAggregationType] = useState('QA');
  const [isUpdatedCols, setIsUpdatedCols] = useState(false)
  const [columnItems, setColumnItems] = useState([])
  const [initColumnItems] = useState([
    {
      value: 'symbol',
      label: 'symbol',
      width: 100,
    },
  ])
  const [isUpdatedWatchList, setIsUpdatedWatchList] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState([])

  const [columns, setColumns] = useState([
    {
      value: 'symbol',
      label: 'symbol',
      width: 100,
    },
    {
      value: 'chart',
      label: 'chart',
      width: 100,
    }
  ]);

  const [timeFrames, setTimeFrames] = useState([])
  const [timeFrameOptions, setTimeFrameOptions] = useState([
    {
      value: '1d',
      label: '1d'
    },
    {
      value: '3d',
      label: '3d'
    },
  ])

  const [watchListData, setWatchListData] = useState([])
  const [watchListInitData, setWatchListInitData] = useState([])

  const handleColumnsChange = () => {
    setIsOpenedEditColumnWidget(true)
  }

  const handleSearching = () => {
    console.log("searching===========")
    // console.log(selectedColumns)
  }

  const handleModalClose = () => {
    setIsOpenedEditColumnWidget(false)
  }

  const loadWatchListOptions = (useCallback(async () => {
    try {
      const data = await getWatchListAll()
      const result = data.result.map((o) => ({
        value: o.name,
        label: o.name
      }))
      setSelectedWatchListOptions(result)
      setSelectedWatchList(result[0])
    } catch (e) {
      console.log(e)
    }
  }, []))
  useEffect(() => {
    loadWatchListOptions()
    setIsLoadedWatchListOptions(true)
  }, [])

  useEffect(() => {
    const getScannerAvailableFields = async () => {
      setSelectedColumns(defaultFields)
    }

    if (isLoadedWatchListOptions) {
      getScannerAvailableFields()
    }

  }, [isLoadedWatchListOptions])


  const handleColumnSet = (columns) => {
    let cols = []
    let temps = []
    let colObjects = []
    Object.keys(columns).forEach((key) => {
      columns[key].children.forEach((col) => {
        cols.push(col.label)
        temps.push(col.label)
      })

      colObjects.push({
        [columns[key].label]: temps
      })
      temps = []
    })
    setIsUpdatedCols(!isUpdatedCols)
    setColumnItems(cols)
    setSelectedColumns(columns)
    if (isConnected) {
      const symbols = selectedSymbols.map((o) => o.value)

      const content = {
        action: 'change_fields',
        chart_number: props.chart_number,
        symbols,
        symbol_type: (selectedWatchList.value === 'crypto' || selectedWatchList.value === 'bigCryptos') ? 'crypto' : 'stock',
        fields: colObjects,
      }

      allViewData.forEach(view => {
        if (view.chart_number === props.chart_number) {
          view.symbols = content.symbols
          view.fields = [...columns]
        }
      })

      ws.send(JSON.stringify(content));
    }
  }

  return (
    <div className="watch-list-item-container">
      <Modal show={isOpenedEditColumnWidget} className="hunter-widget-modal" onHide={() => handleModalClose()}>
        <WatchListEditColumnWidget
          handleModalClose={handleModalClose}
          setColumns={handleColumnSet}
          selectedColumns={selectedColumns}
        />
      </Modal>
      <div className="watch-list-item-wrap hunter-watch-list-item-wrap">
        <div className="watch-list-item-header">
          <Input placeholder="Search..">

          </Input>
          <Button
            className=""
            onClick={() => { handleSearching() }}
          >
            <i class="fa fa-search"></i>
          </Button>
          <Button
            size="sm"
            className=""
            onClick={() => { handleColumnsChange() }}
          >
            change columns
          </Button>
        </div>
        <div className="watch-list-item-content">
          {/* <MDBTable
            hover
            dark={true}
            maxHeight='100%'
            height={`${(props.chartColumn === 1 || props.chartColumn === 2) ? '800px' : '100%'}`}
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
          >
            <MDBTableHead  className="watch-list-data-table-header">
              <tr>
                {columns.map((item) => (
                  <th key={item.label} className={`${item.value === 'chart' ? 'hunter-custom-table-chart-th' : ''}`}>{item.label}</th>
                ))}
              </tr>
            </MDBTableHead>
            <MDBTableBody
              className={"financial-table-body-1"}
            >
              {watchListInitData && watchListInitData.map((item) => (
                isSelectedSymbol(item.symbol) && 
                <tr key={`row-${item.symbol}`}>
                  {columns.map((column) => 
                    (
                      <td 
                        key={`${item.symbol}-${column.value}`}
                        className={`hunter-financial-table-column ${column.value === 'chart' ? 'table-chart-column' : ''} ${indicatorStyle(column.value, item)}`}
                      >
                        {isValidNUmber(item[column.value]) ? (item[column.value] || item[column.value] === '' ? parseFloat(item[column.value]).toFixed(2): '') : item[column.value]}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable> */}
          <div className="hunter-search-filter-area">
            <div className='input-group date hunter-date-time-picker' id='datetimepicker1'>
              {/* <MultiRangeSlider
              selectDateRange={selectDateRange}
            /> */}
              {/* <ButtonCsvDownload filename={"price.csv"}>Csv Download</ButtonCsvDownload> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchListItem;