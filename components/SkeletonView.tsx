import { Box } from "./ui/box";
import { HStack } from "./ui/hstack";
import { Skeleton, SkeletonText } from "./ui/skeleton";

export const SkeletonView = () => (
  <Box className="android:w-1/2 ios:w-1/2 overflow-hidden lg:w-1/5 md:w-1/4 sm:w-1/3 w-1/2 rounded-none gap-1">
    <Box className={`m-2`}>
      <Skeleton
        variant="sharp"
        className={`mb-[10px] h-[150px] sm:h-[250px] w-full rounded-md`}
      />
      <Box className="p-2 gap-3">
        <SkeletonText _lines={1} className="h-3 w-1/2" />
        <HStack className="gap-1 w-full">
          <Box className="w-1/2  gap-3 items-center">
            <Skeleton variant="rounded" className="h-[60px] w-2/3" />
          </Box>
          <Box className="w-1/2 items-center gap-3 justify-center">
            <Skeleton variant="rounded" className="h-[60px] w-2/3" />
          </Box>
        </HStack>
      </Box>
    </Box>
  </Box>
);
