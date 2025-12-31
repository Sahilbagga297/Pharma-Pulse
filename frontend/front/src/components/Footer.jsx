const Footer = () => {
    return (
        <footer className="bg-gray-800 text-center text-white p-3 md:p-4 text-sm md:text-base">
            <p>&copy; {new Date().getFullYear()} My Portfolio Website. All rights reserved.</p>
        </footer>
    );
}
export default Footer;