import {
  Stat,
  StatLabel,
  StatHelpText,
  Image,
  Center,
  Box,
  Button,
  useColorMode,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import GitInfo from "react-git-info/macro";

function Footer() {
  const gitInfo = GitInfo();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box
      className="footer"
      as="footer"
      role="contentinfo"
      mx="auto"
      py="6"
      px={{ base: "4", md: "8" }}
    >
      <Grid templateColumns="repeat(3,auto)">
        <GridItem alignSelf="end" justifySelf="start">
          <Text fontSize="sm">build : {gitInfo.commit.hash.slice(-6)}</Text>
        </GridItem>
        <GridItem>
          <Stat>
            <StatHelpText>
              Like this app? Consider supporting me at the address bellow. It
              will help improve this appand build other apps for the
              StakeborgDAO community.
            </StatHelpText>
            <StatLabel>***REMOVED***</StatLabel>

            <Center>
              <Image
                boxSize="25px"
                src="https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818"
                alt="img"
              />
              <Image
                boxSize="30px"
                src="https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
                alt="img"
              />
              <Image
                boxSize="25px"
                src="https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912"
                alt="img"
              />
            </Center>
          </Stat>
        </GridItem>
        <GridItem alignSelf="end" justifySelf="end">
          <Button onClick={toggleColorMode} maxW="3rem">
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default Footer;
