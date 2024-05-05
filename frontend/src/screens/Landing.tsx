import { useNavigate } from "react-router-dom"

export const Landing = () => {

    const navigate = useNavigate();

    return <div>
        <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex justify-center mt-4">
                    <img src={"/chessBoard_NeoIceySea.jpeg"} className="max-w-2xl"/>
                </div>
                <div>
                    <h1 className="text-white text-4xl font-bold text-center mt-4">Check Matey</h1>
                    <p className="py-2 text-center text-2xl font-bold text-slate-300">
                        Play Chess And its variations online with your friends
                    </p>
                    <div className="flex justify-center mt-3">
                        <button onClick={() => {navigate("/game")}} className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-5 px-5 rounded focus:outline-none focus:shadow-outline">
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}