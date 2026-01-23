'use client'

import { useState } from 'react'
import { Calendar, ChevronsUpDown } from 'lucide-react'

export default function LoadingToDd() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [destination, setDestination] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Empty data array - no mock data
  const tableData = []

  const totalEntries = tableData.length

  const handleFetch = () => {
    console.log('Fetching data with filters:', { startDate, endDate, destination })
  }

  const handleDelivered = (rowIndex) => {
    console.log('Marking as delivered:', rowIndex)
  }

  const handleNotDelivered = (rowIndex) => {
    console.log('Marking as not delivered:', rowIndex)
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = tableData.slice(startIndex, endIndex)
  const totalPages = Math.ceil(totalEntries / rowsPerPage)

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 md:px-6 lg:px-8">

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Manifest To Direct Delivery
      </h1>

      {/* Filters Section - Top Right */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
        <div className="flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Filters</div>

          {/* Date Range and Destination Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
            <div className="flex-1 sm:flex-initial">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                START DATE
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 pr-8 sm:pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
                <Calendar className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 sm:flex-initial">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                END DATE
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 pr-8 sm:pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
                <Calendar className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 sm:flex-initial">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DESTINATION
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              >
                <option value="">Select Destination</option>
                <option value="SUL">(SUL) Sullkot</option>
              </select>
            </div>

            <button
              onClick={handleFetch}
              className="px-4 sm:px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium whitespace-nowrap"
            >
              Fetch
            </button>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Actions</span>
              <select
                className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm"
              >
                <option value="">Select Action</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[6%]" />
              <col className="w-[6%]" />
              <col className="w-[6%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Sr.No</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Action</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th colSpan="3" className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-center text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Transit</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Manifest</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">CN</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Pieces</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Weight</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">C. Vigs</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Shipper</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">Consignee</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-700 uppercase tracking-tight border-b border-gray-200">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="leading-tight">To Pay</span>
                    <ChevronsUpDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th></th>
                <th></th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Date</th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Origin</th>
                <th className="px-0.5 sm:px-1 md:px-1.5 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Destination</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-1 sm:px-2 md:px-3 lg:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 text-center break-words">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 flex-wrap">
                        <button
                          onClick={() => handleDelivered(startIndex + index)}
                          className="px-2 sm:px-3 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors text-[8px] sm:text-[9px] md:text-[10px] font-medium whitespace-nowrap"
                        >
                          Delivered
                        </button>
                        <button
                          onClick={() => handleNotDelivered(startIndex + index)}
                          className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-[8px] sm:text-[9px] md:text-[10px] font-medium whitespace-nowrap"
                        >
                          Not Delivered
                        </button>
                      </div>
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.transitDate || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.origin || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.destination || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.manifest || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.cn || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.pieces || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.weight || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.cVigs || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.shipper || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.consignee || ''}
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-1.5 py-1.5 sm:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-900 break-words">
                      {row.toPay || ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(endIndex, totalEntries)} of {totalEntries} entries
          </div>
          <div className="flex gap-2 justify-center sm:justify-end">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 sm:px-4 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 1
                  ? 'bg-sky-600 text-white border-transparent'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= totalEntries}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

