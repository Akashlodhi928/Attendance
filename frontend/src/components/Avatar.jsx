const Avatar = ({ name, image }) => {

  if (image) {
    return (
      <img
        src={image}
        alt="avatar"
        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
      />
    );
  }

  // fallback letter
  return (
    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
      {name?.charAt(0).toUpperCase()}
    </div>
  );
};

export default Avatar;