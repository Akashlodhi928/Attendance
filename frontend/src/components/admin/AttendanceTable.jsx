function AttendanceTable({data}) {

  return(

    <div className="bg-white rounded-xl shadow overflow-x-auto">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">Photo</th>
            <th className="p-3 text-left">Employee</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Check In</th>
            <th className="p-3 text-left">Check Out</th>
            <th className="p-3 text-left">Status</th>

          </tr>

        </thead>

        <tbody>

          {data.length === 0 && (

            <tr>

              <td colSpan="6" className="text-center py-8 text-gray-400">

                No attendance records found

              </td>

            </tr>

          )}

          {data.map(item=>(

            <tr key={item._id} className="border-b hover:bg-gray-50">

              {/* Photo */}

              <td className="p-3">

                <img
                  src={item.image}
                  className="w-10 h-10 rounded-full object-cover"
                />

              </td>


              {/* Name */}

              <td className="p-3 font-medium">

                {item.user?.name || "Employee"}

              </td>


              {/* Address */}

              <td className="p-3 text-sm text-gray-600 max-w-[300px] truncate">

                {item.address}

              </td>


              {/* CheckIn */}

              <td className="p-3">

                {item.checkInTime
                  ? new Date(item.checkInTime).toLocaleTimeString()
                  : "--"
                }

              </td>


              {/* CheckOut */}

              <td className="p-3">

                {item.checkOutTime
                  ? new Date(item.checkOutTime).toLocaleTimeString()
                  : "--"
                }

              </td>


              {/* Status */}

              <td className="p-3">

                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${item.checkOutTime
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>

                  {item.checkOutTime ? "Completed" : "Active"}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}

export default AttendanceTable