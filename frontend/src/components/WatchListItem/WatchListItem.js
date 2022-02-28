import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
// import BarChart from 'components/FinancialDashboard/SmallBarChart';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import WatchListEditColumnWidget from 'components/WatchListEditColumnWidget/WatchListEditColumnWidget'
import './WatchListItem.css'
import Select from 'react-select'
import {
  getMultiFinancials, getScannerViewData, saveScannerView, getWatchListAll
} from 'api/Api';

const WatchListItem = (props) => {
  const { allViewData, setAllViewData } = props;
  const [isLoadedWatchListOptions, setIsLoadedWatchListOptions] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState(
    [
      {
        label: "Indicators",
        value: "parent_value_2",
        children: [
          // {
          //     label: "rsi",
          //     value: "child_value_2_1",
          //     default: true
          // },
          // {
          //     label: "rsi2",
          //     value: "child_value_2_2",
          //     default: true
          // },
          // {
          //     label: "rsi3",
          //     value: "child_value_2_3",
          //     default: false
          // },
          // {
          //     label: "heik",
          //     value: "child_value_2_4",
          //     default: false
          // },
          // {
          //     label: "heik2",
          //     value: "child_value_2_5",
          //     default: false
          // }
        ],
        "default": true
      }
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
    console.log(selectedColumns)
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
      const result = await getScannerViewData(props.chart_number)
      if (result) {
        let columns = result.fields;
        if (columns) {
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
          setColumnItems(cols)
          setSelectedColumns(columns)
          setIsUpdatedCols(!isUpdatedCols)
        }
      }
    }

    if (isLoadedWatchListOptions) {
      getScannerAvailableFields()
    }

  }, [isLoadedWatchListOptions])

  useEffect(() => {
    const loadRows = async () => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'name': selectedWatchList.value
        })
      };
      let rows = []

      try {
        await fetch(process.env.REACT_APP_BACKEND_URL + "/scanner/watchlists/", requestOptions)
          .then(response => response.json())
          .then(async data => {

            rows = data.result

            const financials = await getMultiFinancials(rows, 'income_statement')
            loadMultiFinancials(financials)

            // setRowItems(data.tables)
            // setIsUpdatedRows(true)

            let realData = [];
            let symbols = [];
            rows.forEach((row) => {
              const object = {}
              columns.forEach((col) => {
                if (col.value === 'chart') {
                  object[col.value] = 'fetching ...'
                } else {
                  object[col.value] = '0.00'
                }
              })
              object.symbol = row
              symbols.push({
                value: row,
                label: row,
              })
              realData.push(object);
            })

            updateChangeSymbol(symbols)
            setSelectedSymbols(symbols)
            setWatchListInitData(realData)
          })
      } catch (error) {
        console.log(error)
      }
    }
    if (selectedWatchList) {
      setIsLoading(1);
      loadRows();
    }
  }, [selectedWatchList])

  useEffect(() => {
    const keys = Object.keys(columnItems)
    if (keys.length) {
      const columns = [...initColumnItems]
      columnItems.forEach((value) => {
        if (value !== 'symbol') {
          columns.push({
            value: value,
            label: value,
            width: 100,
          })
        }
      })
      columns.push({
        value: 'chart',
        label: 'chart',
        width: 100,
      })
      setColumns(columns)
    } else {
      setColumns([
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
      ])
    }

  }, [isUpdatedCols])

  const isValidChartData = (symbol) => {
    if (!chartMultiData.length) {
      return false
    }
    const filtered = chartMultiData.filter((chartData) => { return chartData.symbol === symbol; })
    if (!filtered.length) {
      return false
    }
    return filtered[0].chartData.length ? true : false
  }

  const loadMultiFinancials = (financials) => {
    if (!financials.length) {
      return
    }

    financials.forEach((financial) => {
      getIncomeFromFinancial(financial[1], financial[0])
    })
  }

  const getChartDataBySymbol = (symbol, isChild) => {
    if (!chartMultiData.length) {
      return []
    }

    const filtered = chartMultiData.filter((chartData) => { return chartData.symbol === symbol })
    if (!filtered.length) {
      return []
    }

    let slicedChartData = filtered[0].chartData.map((chart) => {
      chart.dataPoints.splice(0, chart.dataPoints.length - 50)//should update whenever
      return chart
    })

    if (isChild) {
      return slicedChartData[0]
    }


    return slicedChartData
  }

  useEffect(() => {
    let initData = watchListInitData
    let newData = []
    let isValid = true

    initData.forEach((init) => {
      watchListData.forEach(o => {
        if (o.symbol === init.symbol) {
          const newObject = {
            symbol: o.symbol,
            ...o.data,
            chart:
              <div className="container custom-container chart-area hunter-scanner-page-chart-area">
                {/* <div className="row justify-content-center hunter-scanner-page-chart-area-wrap">
                  {isValidChartData(o.symbol) ? (
                    <BarChart
                      data={getChartDataBySymbol(o.symbol, true)}
                      chartData={getChartDataBySymbol(o.symbol, false)}
                      globalAggregationType={selectedAggregationType}
                    />
                  ) : isLoading === 2 ? (
                    <div className="no-data">No data</div>
                  ) : (
                    <div className="no-data">Fetching...</div>
                  )}
                </div> */}
              </div>,
          }
          newData.push(newObject)
          isValid = false
        }
      })
      if (isValid) {
        newData.push(init)
      }
      isValid = true
    })

    setWatchListInitData(newData)
    setIsUpdatedWatchList(false)
  }, [isUpdatedWatchList])

  useEffect(() => {

    let cols = []
    let temps = []
    let colObjects = []

    Object.keys(selectedColumns).forEach((key) => {
      selectedColumns[key].children.forEach((col) => {
        cols.push(col.label)
        temps.push(col.label)
      })

      colObjects.push({
        [selectedColumns[key].label]: temps
      })
      temps = []
    })

    if (isConnected) {
      const symbols = selectedSymbols.map((o) => o.value)

      const content = {
        action: 'create_fields',
        chart_number: props.chart_number,
        symbols,
        symbol_type: (selectedWatchList.value === 'crypto' || selectedWatchList.value === 'bigCryptos') ? 'crypto' : 'stock',
        fields: colObjects,
      }

      ws.send(JSON.stringify(content));
      console.log('First Connection options sent to BE', content)
    }
  }, [isConnected])

  const updateChangeSymbol = (symbolList) => {
    let cols = []
    let temps = []
    let colObjects = []
    const columns = selectedColumns
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
    // setIsUpdatedCols(!isUpdatedCols)
    // setColumnItems(cols)
    // setSelectedColumns(columns)

    if (isConnected) {
      const symbols = symbolList.map((o) => o.value)

      const content = {
        action: selectedWatchList.value === 'crypto' ? 'create_fields' : 'change_fields',
        chart_number: props.chart_number,
        symbols,
        symbol_type: (selectedWatchList.value === 'crypto' || selectedWatchList.value === 'bigCryptos') ? 'crypto' : 'stock',
        fields: colObjects,
      }

      ws.send(JSON.stringify(content));
    }
  }

  const loadview = async () => {
    const result = await getScannerViewData(props.chart_number)
    if (result) {
      let columns = result.fields;
      if (columns) {
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
        setColumnItems(cols)
        setSelectedColumns(columns)
        setIsUpdatedCols(!isUpdatedCols)

        allViewData.forEach(view => {
          if (view.chart_number === props.chart_number) {
            view.fields = [...columns]
          }
        })
      }
    }
  }

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




  const getIncomeFromFinancial = async (financial, symbol) => {
    let revenus = {
      label: 'Revenue',
      group: 0,
      color: 'rgb(25, 185, 154)',
      dataPoints: [],
    };
    let costOfRevenue = {
      label: 'Cost of Revenue',
      group: 0,
      color: 'rgb(8, 64, 129)',
      dataPoints: [],
    };
    let grossProfit = {
      label: 'Gross Profit',
      group: 0,
      color: 'rgb(127, 0, 0)',
      dataPoints: [],
    };
    let EBITDAMargin = {
      label: 'Ebit',
      group: 0,
      color: 'rgb(89, 201, 108)',
      dataPoints: [],
    };
    let NetIncome = {
      label: 'Net Income',
      group: 0,
      color: 'rgb(75, 87, 74)',
      dataPoints: [],
    };
    let earningsPerBasicShare = {
      label: 'Earnings per Basic Share',
      group: 0,
      color: 'rgb(226, 71, 130)',
      dataPoints: [],
    };

    if (financial && financial.length) {
      financial.forEach((item) => {
        revenus.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.revenues,
        });
        costOfRevenue.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.costOfRevenue,
        });
        grossProfit.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.grossProfit,
        });
        EBITDAMargin.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.EBITDAMargin,
        });
        NetIncome.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.netIncome,
        });
        earningsPerBasicShare.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.earningsPerBasicShare,
        });
      });
    }

    const multiCharts = chartMultiData;
    multiCharts.push({
      symbol: symbol,
      chartData: [
        sortDataPointsByDate(revenus),
        sortDataPointsByDate(costOfRevenue),
        sortDataPointsByDate(grossProfit),
        sortDataPointsByDate(EBITDAMargin),
        sortDataPointsByDate(NetIncome),
        sortDataPointsByDate(earningsPerBasicShare),
      ]
    })

    setChartMultiData(multiCharts)
    setIsLoading(2);
  };

  const createWebSocket = (async (isUpdate) => {
    if (ws) {
      if (isUpdate) {
        ws.close()
      } else {
        return
      }
    }

    const socket = new WebSocket(process.env.REACT_APP_SOCKET_URL);
    setWs(socket)

    socket.onopen = () => {
      setIsConnected(true);
      console.log('Opened Connection!')
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        setWatchListData(msg)
        setIsUpdatedWatchList(true)
      } catch (error) {
        console.log(error)
      }
    };

    socket.onclose = () => {
      console.log('Closed Connection!')
    };
  })

  useEffect(() => {
    if (isLoading === 2) {
      createWebSocket(false)
    }
  }, [isLoading])

  const sortDataPointsByDate = (data) => {
    let sortedData = { ...data };
    if (sortedData.dataPoints.length > 0) {
      sortedData.dataPoints.sort(function (a, b) {
        let valueA = a['calendarDate'];
        let valueB = b['calendarDate'];
        if (typeof a['calendarDate'] != 'string') {
          valueA = valueA.toString();
        }
        if (typeof b['calendarDate'] != 'string') {
          valueB = valueB.toString();
        }
        return valueA.localeCompare(valueB);
      });
    }
    return sortedData;
  };

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
        {/* <div className="watch-list-item-content">
          <MDBTable
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
          </MDBTable>
        </div>   */}
      </div>
    </div>
  )
}

export default WatchListItem;