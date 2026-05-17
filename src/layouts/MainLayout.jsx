import Sidebar from "../components/Sidebar"

function MainLayout({ children }) {

    return (

        <div className="flex">

            <Sidebar />

            <div className="flex-1 bg-gray-100 min-h-screen p-6">

                {children}

            </div>

        </div>
    )
}

export default MainLayout