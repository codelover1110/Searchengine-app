import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Button, Input } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
// import BarChart from 'components/FinancialDashboard/SmallBarChart';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import WatchListEditColumnWidget from 'components/WatchListEditColumnWidget/WatchListEditColumnWidget'
import './WatchListItem.css'
import Select from 'react-select'

import { useCsvDownloadUpdate } from "contexts/CsvDownloadContext"

import { defaultFields, defaultItmes } from '../WatchListEditColumnWidget/components/modal/nodes'
import ButtonCsvDownload from 'components/ButtonCsvDownload'
import {useDatatableLoading, useDatatable, usePagination, usePaginationUpdate} from "contexts/DatatableContext"
import {
  getSearchingData
} from 'api/Api';

import { CSVLink } from "react-csv"

import { MDBDataTableV5 } from 'mdbreact';

const WatchListItem = (props) => {
  const [isLoadedWatchListOptions, setIsLoadedWatchListOptions] = useState(true)
  const [selectedColumns, setSelectedColumns] = useState(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenedEditColumnWidget, setIsOpenedEditColumnWidget] = useState(false)
  const [isUpdatedCols, setIsUpdatedCols] = useState(false)
  const [columnItems, setColumnItems] = useState([])
  const [totalHeader, setTotalHeader] = useState([])


  const handleColumnsChange = () => {
    setIsOpenedEditColumnWidget(true)
  }

  const handleSearching = () => {
    console.log("searching===========")
    console.log(selectedColumns)
  }

  const handleModalClose = () => {
    setIsOpenedEditColumnWidget(false)
  }

  useEffect(() => {
    setIsLoadedWatchListOptions(true)
    loadSearchingData()
  }, [])

  const loadSearchingData =  async () => {
    const result = await getSearchingData();
    if (!result.success || result.data == undefined) return;
    setTotalHeader(result.data.header)
    let headerData = filterTableData(defaultFields)
    const tableHeader = await hearder_columns(headerData);
    let bodyData = result.data.rows
    bodyData.forEach(function (row, index) {
      for (let item in row) {
        if (!headerData.includes(item)) {
          delete bodyData[index][item]
        }
      }
    });
    setDatatable({
      columns: tableHeader,
      rows:bodyData
    })
    
  }

  const filterTableData = (filterData) => {
    let filterItems = []
    filterData.forEach(function (itemTree, index) {
      if (itemTree.default) {
        itemTree.children.forEach(function (item, index) {
          filterItems.push(item.label)
        });
      }
    });
    return filterItems
  }

  const [datatable, setDatatable] = React.useState({
    columns: [],
    rows: []
  })

  // const [, setLoadingData] = useDatatableLoading()

  const updateCsvDownload = useCsvDownloadUpdate();

  // const [, setDatatable] = useDatatable({
  //   columns: hearder_columns,
  //   rows: [
  //   ],
  // });

  const hearder_columns = async (headerData) => {
    let table_header = []
    headerData.map(item => {
      if (item == 'Avg # Bars In Losing Trades: All') {
        table_header.push({
          label: 'Avg # Bars In Losing Trades: All',
          field: 'Avg # Bars In Losing Trades: All',
          width: 300,
          attributes: {
            'aria-controls': 'DataTable',
            'aria-label': 'Avg # Bars In Losing Trades: All',
          }
        })
      } else {
        table_header.push({
          label: item,
          field: item,
          width: 300,
        })
      }
    })

    return table_header
  }

  useEffect(() => {
    const getScannerAvailableFields = async () => {
      setSelectedColumns(defaultFields)
    }

    console.log(defaultFields)

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
        <div className={"d-flex align-items-center"}>
          <Button className={"btn btn-primary py-2 my-0 hunter-csv-download-button"}>Csv Download</Button>
        </div>
        <div>
          <MDBDataTableV5 hover entriesOptions={[10, 15]} entries={10} pagesAmount={4} data={datatable} fullPagination  />
        </div>
        <div className="watch-list-item-content">

          <div className="hunter-search-filter-area">
            <div className='input-group date hunter-date-time-picker' id='datetimepicker1'>
            {/* <MDBDataTableV5 hover entriesOptions={[10, 15]} entries={10} pagesAmount={4} data={datatable} fullPagination  /> */}
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