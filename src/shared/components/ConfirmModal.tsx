import { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  content: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm action",
  content,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col items-center text-center z-[10000]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-2 text-gray-700">{content}</div>
        <div className="mt-4 flex justify-center gap-4 w-full">
          {/* Cancel Button */}
          <button
            className="px-4 py-2 text-white bg-[#DC2625] border border-[#DC2625] rounded-md cursor-pointer text-lg font-semibold transition-all duration-300 ease-in-out transform hover:bg-transparent hover:text-[#DC2625] hover:scale-105"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* Confirm Button */}
          <button
            className="px-4 py-2 text-white bg-[#5CB85C] border border-[#5CB85C] rounded-md cursor-pointer text-lg font-semibold transition-all duration-300 ease-in-out transform hover:bg-transparent hover:text-[#5CB85C] hover:scale-105"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}


// export default function ConfirmModal({
//   isOpen,
//   title = "Confirmation",
//   content,
//   onClose,
//   onConfirm,
// }: ConfirmModalProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/50">
//       <div className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col items-center text-center">
//         <h2 className="text-lg font-semibold">{title}</h2>
//         <div className="mt-2 text-gray-700">{content}</div>
//         <div className="mt-4 flex justify-center gap-4 w-full">
//           {/* Cancel Button */}
//           <button
//             className="px-4 py-2 text-white bg-[#DC2625] border border-[#DC2625] rounded-md cursor-pointer text-lg font-semibold transition-all duration-300 ease-in-out transform hover:bg-transparent hover:text-[#DC2625] hover:scale-105"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           {/* Confirm Button */}
//           <button
//             className="px-4 py-2 text-white bg-[#5CB85C] border border-[#5CB85C] rounded-md cursor-pointer text-lg font-semibold transition-all duration-300 ease-in-out transform hover:bg-transparent hover:text-[#5CB85C] hover:scale-105"
//             onClick={onConfirm}
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }