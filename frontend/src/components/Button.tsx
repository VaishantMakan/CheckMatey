export const Button = ({onClick, children} : {onClick: () => void, children: React.ReactNode}) => {
    return <button onClick={onClick} className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-5 px-5 rounded focus:outline-none focus:shadow-outline">
    {children}
</button>
}