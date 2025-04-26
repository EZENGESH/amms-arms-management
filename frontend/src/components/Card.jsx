export default function Card({ title, children }) {
    return (
        <div className="bg-white p-4 shadow rounded-lg">
            {title && <h2 className="font-semibold text-lg mb-2">{title}</h2>}
            {children}
        </div>
    );
}