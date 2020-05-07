
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJCFGtxoFvquT/MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1qNzlseWQzOC5hdXRoMC5jb20wHhcNMjAwNTAzMDQ0OTE4WhcNMzQw
MTEwMDQ0OTE4WjAhMR8wHQYDVQQDExZkZXYtajc5bHlkMzguYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuWqA+/lUqrOjdOUfaZ9p5e4T
czJGCDA1D37Og00fnclQDQIYj/pzyRl0Sp/bHKuThGwkzqhOtu++Ee4vf3ZwaqCX
ZcvOSb26h86k4n102CFdZ5U5VoIIv59TDzr5wnPT5nGMwf87ttl73LsE9uhKe75a
6SEn7IprmofoqdxbXZvxT52Y7fHzsV6DI4l7Op/LnZfKg4MEr2+PuHoZbch4jm3J
IIlmc5JRUwgK4uxjnJmqPqYTffvpQ4IibyT52t5DKc0Sfo1MY+U7D6ePkTINWoKu
bOA5P46wAYF3azXhqUX0Dp61UrWVHmTaJ9jnJdDE8gksOAG8veqJdXmcuXXQCQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSQ6u/fsXarKMFKWrNG
aQmXgq+8xTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBALM/EANm
WzUn8kvgEOwt7OmzumI9a7UWB6QPlFDY9rvvPKEzO2X0+b5ISYZS8I32Bq1qgiSq
t3Fa3oNODRH+Q4HE/xKSlYIPYLYIShyz4R/4rvdiibcW1gLpsJ088Bjh7jIrNvmp
wZdyRzgNlZ0TMMulGvhJSXvWj4/reFQ0yzLkjSwDAQ7a1s5DJEQDW2++lvriCIpe
Nt63h5PHKm0RGFk0Gll8FdaqFz7vrUqHwbHTjhlZs93c5pzVJ58kHfMhExZdvMxP
pkTTCkKfvk2D/kfR2Kwl+By/BdNA1SS6M90bpU5zpIHahRiy9cPOD26WEXIzLYe8
qMafAs+MiLQkF3o=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
