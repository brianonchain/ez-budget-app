export default function ErrorMessage({ message }: { message: string }) {
  return <p className={`py-2 min-h-16 desktop:min-h-14 w-full flex justify-center items-center text-textDanger`}>{message}</p>;
}
