interface GroupPops {
  title: string;
  value: string;
}

export default function GroupText({ title, value }: GroupPops) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#130160]">{title}</p>
      <p className="text-sm text-gray-600 mx-1 my-1">{value}</p>
    </div>
  );
}
